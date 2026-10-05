-- ============================================================================
-- OFIS VERIFIED BOOKING CONCURRENCY & INTEGRITY MIGRATION
-- Atomic PostgreSQL Advisory Lock, Interval Overlap & Capacity Protection
-- ============================================================================

-- 1. Performance Composite Index for Real-Time Availability Queries
CREATE INDEX IF NOT EXISTS idx_bookings_availability_lookup
ON public.bookings (space_id, date, status, payment_status);

-- 2. Performance Composite Index for Desk / Seat Availability
CREATE INDEX IF NOT EXISTS idx_bookings_seat_lookup
ON public.bookings (space_id, date, selected_seat_id)
WHERE selected_seat_id IS NOT NULL;

-- 3. Upgrade confirm_booking_payment with Transaction-Level Advisory Lock and Atomic Overlap Check
CREATE OR REPLACE FUNCTION public.confirm_booking_payment(
    p_booking_id TEXT,
    p_transaction_reference TEXT,
    p_provider TEXT DEFAULT 'sznd',
    p_amount NUMERIC DEFAULT 0,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_booking RECORD;
    v_space RECORD;
    v_start_min INT;
    v_end_min INT;
    v_is_exclusive BOOLEAN;
    v_conflict_count INT := 0;
    v_total_overlapping_guests INT := 0;
BEGIN
    -- 1. Fetch Target Booking
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'BOOKING_NOT_FOUND',
            'error', 'Booking ' || p_booking_id || ' not found'
        );
    END IF;

    -- Idempotency: if already confirmed for this payment reference, return success
    IF (v_booking.status = 'confirmed' OR v_booking.booking_status = 'confirmed') 
       AND v_booking.payment_reference = p_transaction_reference THEN
        RETURN jsonb_build_object(
            'success', true,
            'booking_id', p_booking_id,
            'reference', p_transaction_reference,
            'status', 'confirmed',
            'message', 'Booking already confirmed'
        );
    END IF;

    -- 2. ACQUIRE TRANSACTION-LEVEL ADVISORY LOCK (SERIALIZE BY SPACE & DATE)
    PERFORM pg_advisory_xact_lock(
        hashtext(v_booking.space_id || '_' || v_booking.date)
    );

    -- 2b. CROSS-BOOKING COLLISION PROTECTION: Ensure reference is not assigned to any other booking
    IF EXISTS (
        SELECT 1 FROM public.bookings
        WHERE (payment_reference = p_transaction_reference OR payment_reference = (p_metadata->>'sznd_transaction_reference'))
          AND id <> p_booking_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'REFERENCE_COLLISION',
            'error', 'Cross-booking collision: payment reference is already bound to another booking'
        );
    END IF;

    -- 2c. Ensure reference is not already used in payments for another booking
    IF EXISTS (
        SELECT 1 FROM public.payments
        WHERE (reference = p_transaction_reference OR reference = (p_metadata->>'sznd_transaction_reference'))
          AND booking_id <> p_booking_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'PAYMENT_REFERENCE_REUSE',
            'error', 'Cross-booking collision: payment reference was already recorded for another booking'
        );
    END IF;

    -- 3. Fetch Space Rules and Capacity
    SELECT * INTO v_space FROM public.spaces WHERE id = v_booking.space_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SPACE_NOT_FOUND',
            'error', 'Space record not found'
        );
    END IF;

    -- 4. Calculate requested start and end minutes from midnight
    v_start_min := (split_part(v_booking.start_time, ':', 1)::INT * 60) + 
                   COALESCE(NULLIF(split_part(v_booking.start_time, ':', 2), '')::INT, 0);
    v_end_min := v_start_min + (COALESCE(v_booking.duration_hours, 2) * 60);

    -- 5. Determine Exclusivity
    -- Exclusive spaces: private_office, meeting, podcast, photography, event OR capacity = 1
    v_is_exclusive := (v_space.category IN ('private_office', 'meeting', 'podcast', 'photography', 'event')) 
                      OR (COALESCE(v_space.capacity, 1) = 1);

    -- 6. Check for Overlapping Active Bookings
    -- Condition for overlap: start_A < end_B AND start_B < end_A
    -- Active blocking filter: status IN ('confirmed', 'ready_for_checkin', 'checked_in', 'in_progress', 'active') AND payment_status = 'paid'
    IF v_booking.selected_seat_id IS NOT NULL THEN
        -- Desk/seat conflict check: scoped to matching selected_seat_id
        SELECT COUNT(*) INTO v_conflict_count
        FROM public.bookings b
        WHERE b.space_id = v_booking.space_id
          AND b.date = v_booking.date
          AND b.id <> p_booking_id
          AND b.selected_seat_id = v_booking.selected_seat_id
          AND b.status IN ('confirmed', 'ready_for_checkin', 'checked_in', 'in_progress', 'active')
          AND b.payment_status = 'paid'
          AND (
              v_start_min < ((split_part(b.start_time, ':', 1)::INT * 60) + COALESCE(NULLIF(split_part(b.start_time, ':', 2), '')::INT, 0) + (COALESCE(b.duration_hours, 2) * 60))
              AND
              ((split_part(b.start_time, ':', 1)::INT * 60) + COALESCE(NULLIF(split_part(b.start_time, ':', 2), '')::INT, 0)) < v_end_min
          );

        IF v_conflict_count > 0 THEN
            RETURN jsonb_build_object(
                'success', false,
                'code', 'SLOT_UNAVAILABLE',
                'error', 'Selected desk/seat is no longer available for the requested time slot'
            );
        END IF;

    ELSIF v_is_exclusive THEN
        -- Exclusive space conflict check: protect entire space from any overlap
        SELECT COUNT(*) INTO v_conflict_count
        FROM public.bookings b
        WHERE b.space_id = v_booking.space_id
          AND b.date = v_booking.date
          AND b.id <> p_booking_id
          AND b.status IN ('confirmed', 'ready_for_checkin', 'checked_in', 'in_progress', 'active')
          AND b.payment_status = 'paid'
          AND (
              v_start_min < ((split_part(b.start_time, ':', 1)::INT * 60) + COALESCE(NULLIF(split_part(b.start_time, ':', 2), '')::INT, 0) + (COALESCE(b.duration_hours, 2) * 60))
              AND
              ((split_part(b.start_time, ':', 1)::INT * 60) + COALESCE(NULLIF(split_part(b.start_time, ':', 2), '')::INT, 0)) < v_end_min
          );

        IF v_conflict_count > 0 THEN
            RETURN jsonb_build_object(
                'success', false,
                'code', 'SLOT_UNAVAILABLE',
                'error', 'This workspace is no longer available for the requested time slot'
            );
        END IF;

    ELSE
        -- Shared / Capacity-limited space: aggregate overlapping guest count
        SELECT COALESCE(SUM(COALESCE(b.guest_count, 1)), 0) INTO v_total_overlapping_guests
        FROM public.bookings b
        WHERE b.space_id = v_booking.space_id
          AND b.date = v_booking.date
          AND b.id <> p_booking_id
          AND b.status IN ('confirmed', 'ready_for_checkin', 'checked_in', 'in_progress', 'active')
          AND b.payment_status = 'paid'
          AND (
              v_start_min < ((split_part(b.start_time, ':', 1)::INT * 60) + COALESCE(NULLIF(split_part(b.start_time, ':', 2), '')::INT, 0) + (COALESCE(b.duration_hours, 2) * 60))
              AND
              ((split_part(b.start_time, ':', 1)::INT * 60) + COALESCE(NULLIF(split_part(b.start_time, ':', 2), '')::INT, 0)) < v_end_min
          );

        IF (v_total_overlapping_guests + COALESCE(v_booking.guest_count, 1)) > COALESCE(v_space.capacity, 20) THEN
            RETURN jsonb_build_object(
                'success', false,
                'code', 'SLOT_UNAVAILABLE',
                'error', 'Workspace capacity exceeded for the requested time slot'
            );
        END IF;
    END IF;

    -- 7. ATOMIC COMMIT: Mark Booking Confirmed & Record Payment
    UPDATE public.bookings
    SET
        status = 'confirmed',
        booking_status = 'confirmed',
        payment_status = 'paid',
        payment_reference = p_transaction_reference,
        payment_method = p_provider,
        updated_at = NOW()
    WHERE id = p_booking_id;

    INSERT INTO public.payments (booking_id, user_id, amount, provider, reference, status, metadata)
    VALUES (p_booking_id, v_booking.user_id, COALESCE(p_amount, v_booking.total_amount), p_provider, p_transaction_reference, 'success', p_metadata)
    ON CONFLICT (reference) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'reference', p_transaction_reference,
        'status', 'confirmed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
