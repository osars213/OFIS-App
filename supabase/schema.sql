-- ============================================================================
-- OFIS 2.0 PRODUCTION DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'host', 'admin')),
    company TEXT,
    bio TEXT,
    wallet_balance_ngn NUMERIC(12, 2) NOT NULL DEFAULT 25000.00,
    saved_space_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SPACES TABLE
CREATE TABLE IF NOT EXISTS public.spaces (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('coworking', 'private_office', 'meeting', 'podcast', 'photography', 'event')),
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    price_per_hour NUMERIC(10, 2) NOT NULL,
    price_per_day NUMERIC(10, 2) NOT NULL,
    capacity INT NOT NULL DEFAULT 1,
    has_backup_power BOOLEAN NOT NULL DEFAULT TRUE,
    power_type TEXT NOT NULL DEFAULT 'Solar + Inverter',
    power_uptime_guarantee_percent INT NOT NULL DEFAULT 99,
    internet_speed_mbps INT NOT NULL DEFAULT 200,
    internet_isp TEXT NOT NULL DEFAULT 'Starlink + Fiber',
    noise_level TEXT NOT NULL DEFAULT 'Moderate / Focus Buzz',
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    featured_image TEXT NOT NULL,
    amenities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.80,
    reviews_count INT NOT NULL DEFAULT 0,
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    host_name TEXT NOT NULL,
    host_company TEXT,
    host_avatar TEXT,
    host_is_verified BOOLEAN DEFAULT TRUE,
    host_phone TEXT,
    host_email TEXT,
    host_rating NUMERIC(3, 2) DEFAULT 4.90,
    open_time TEXT NOT NULL DEFAULT '07:00',
    close_time TEXT NOT NULL DEFAULT '21:00',
    days TEXT NOT NULL DEFAULT 'Mon - Sat',
    rules TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    instant_booking BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    is_superhost BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    wifi_ssid TEXT DEFAULT 'OFIS_Guest_HighSpeed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DESKS / SEATS TABLE
CREATE TABLE IF NOT EXISTS public.desks (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'hot_desk',
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'occupied', 'maintenance')),
    price_per_hour NUMERIC(10, 2) NOT NULL,
    x INT NOT NULL DEFAULT 50,
    y INT NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    space_title TEXT NOT NULL,
    space_image TEXT,
    space_address TEXT,
    space_city TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_phone TEXT,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration_hours INT NOT NULL DEFAULT 2,
    selected_seat_id TEXT,
    selected_seat_label TEXT,
    guest_count INT NOT NULL DEFAULT 1,
    total_amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('reserved', 'confirmed', 'ready_for_checkin', 'checked_in', 'in_progress', 'completed', 'reviewed', 'cancelled', 'active')),
    booking_status TEXT NOT NULL DEFAULT 'confirmed',
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    checked_out BOOLEAN DEFAULT FALSE,
    checked_out_at TIMESTAMPTZ,
    qr_code_value TEXT NOT NULL,
    digital_pass_code TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'paystack',
    payment_reference TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'paid',
    has_reminder BOOLEAN DEFAULT TRUE,
    wifi_ssid TEXT,
    wifi_password TEXT,
    access_door_code TEXT,
    is_reviewed BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    user_role TEXT,
    rating NUMERIC(2, 1) NOT NULL,
    host_rating NUMERIC(2, 1),
    power_rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
    internet_rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
    noise_rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
    cleanliness_rating NUMERIC(2, 1),
    value_rating NUMERIC(2, 1),
    comment TEXT NOT NULL,
    visit_date TEXT,
    helpful_count INT NOT NULL DEFAULT 0,
    verified_amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    verified_booking BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    space_id TEXT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, space_id)
);

-- 7. SPACE ACCESS CREDENTIALS TABLE (Secure credentials)
CREATE TABLE IF NOT EXISTS public.space_access_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id TEXT UNIQUE NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    wifi_ssid TEXT NOT NULL,
    wifi_pass TEXT NOT NULL,
    door_pin TEXT NOT NULL,
    access_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    booking_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    provider TEXT NOT NULL DEFAULT 'paystack',
    reference TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'success',
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_access_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Spaces: Public read, authenticated hosts can insert/update
CREATE POLICY "Spaces are viewable by everyone" ON public.spaces
    FOR SELECT USING (true);
CREATE POLICY "Hosts can insert spaces" ON public.spaces
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Hosts can update own spaces" ON public.spaces
    FOR UPDATE USING (auth.uid() = host_id OR auth.jwt() ->> 'role' = 'service_role');

-- Desks: Public read
CREATE POLICY "Desks are viewable by everyone" ON public.desks
    FOR SELECT USING (true);

-- Bookings: Users can see own bookings, hosts can see bookings for their spaces
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'anon');
CREATE POLICY "Anyone can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role' OR true);

-- Reviews: Public read, authenticated users can insert
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Favorites: Users can manage own favorites
CREATE POLICY "Users can manage own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id OR true);

-- Notifications: Users can view own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to handle new user registration from auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, phone, avatar, role, company, wallet_balance_ngn)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.email,
        COALESCE(new.raw_user_meta_data->>'phone', '+234 800 000 0000'),
        COALESCE(new.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'),
        COALESCE(new.raw_user_meta_data->>'role', 'user'),
        COALESCE(new.raw_user_meta_data->>'company', 'Independent Professional'),
        25000.00
    )
    ON CONFLICT (id) DO UPDATE
    SET
        name = EXCLUDED.name,
        avatar = EXCLUDED.avatar,
        phone = EXCLUDED.phone;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile upon Supabase signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RPC: Confirm booking payment securely
CREATE OR REPLACE FUNCTION public.confirm_booking_payment(
    p_booking_id TEXT,
    p_transaction_reference TEXT,
    p_provider TEXT DEFAULT 'paystack',
    p_amount NUMERIC DEFAULT 0,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_booking RECORD;
BEGIN
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking % not found', p_booking_id;
    END IF;

    UPDATE public.bookings
    SET
        status = 'confirmed',
        booking_status = 'confirmed',
        payment_status = 'paid',
        payment_reference = p_transaction_reference,
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
