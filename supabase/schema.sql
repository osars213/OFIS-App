-- ==============================================================================
-- OFIS: Complete Production Supabase PostgreSQL Database Schema
-- Version: 4.0.0 (Production Hardened & Audited)
-- Marketplace for discovering and booking physical workspaces and studios in Nigeria
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- 2. ENUM TYPES
do $$ begin
    create type user_role as enum ('client', 'host', 'admin', 'coworker');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type verification_status_type as enum ('unverified', 'pending', 'verified', 'rejected', 'suspended');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type booking_status_type as enum ('pending', 'payment_pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'expired');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type payment_status_type as enum ('pending', 'successful', 'failed', 'refunded', 'abandoned');
exception
    when duplicate_object then null;
end $$;

-- ==============================================================================
-- 3. PROFILES TABLE (Linked to Supabase auth.users)
-- ==============================================================================
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text not null default '',
    phone text default '',
    whatsapp text default '',
    avatar_url text default 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role user_role not null default 'client',
    company text default '',
    bio text default '',
    is_superhost boolean not null default false,
    verification_status verification_status_type not null default 'unverified',
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Privilege Escalation Shield: Prevent non-admins from self-promoting to admin, verified, or superhost
create or replace function public.protect_profile_privileged_fields()
returns trigger as $$
declare
    v_is_admin boolean;
begin
    -- Determine if the current session caller is an authenticated administrator
    select (role = 'admin') into v_is_admin
    from public.profiles
    where id = auth.uid();

    if coalesce(v_is_admin, false) is distinct from true and auth.role() != 'service_role' then
        -- Normal users can only edit non-privileged self-service fields
        new.role := old.role;
        new.verification_status := old.verification_status;
        new.is_superhost := old.is_superhost;
        new.id := old.id;
        new.email := old.email;
    end if;
    new.updated_at := timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_protect_profile_privileged_fields on public.profiles;
create trigger trg_protect_profile_privileged_fields
    before update on public.profiles
    for each row execute function public.protect_profile_privileged_fields();

-- Automatic Profile Creation Trigger (Sanitized against metadata injection)
create or replace function public.handle_new_user()
returns trigger as $$
declare
    v_requested_role text;
    v_assigned_role user_role;
begin
    v_requested_role := lower(coalesce(new.raw_user_meta_data->>'role', 'client'));
    
    -- Strict privilege check: NEVER permit signup payload to grant 'admin' role
    if v_requested_role in ('host') then
        v_assigned_role := 'host'::user_role;
    else
        v_assigned_role := 'client'::user_role;
    end if;

    insert into public.profiles (
        id,
        email,
        full_name,
        role,
        avatar_url,
        phone,
        is_superhost,
        verification_status
    )
    values (
        new.id,
        coalesce(new.email, ''),
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        v_assigned_role,
        coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
        coalesce(new.raw_user_meta_data->>'phone', ''),
        false,
        'unverified'::verification_status_type
    )
    on conflict (id) do update set
        email = excluded.email,
        full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
        updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ==============================================================================
-- 4. SPACE CATEGORIES TAXONOMY
-- ==============================================================================
create table if not exists public.space_categories (
    id uuid primary key default gen_random_uuid(),
    code text unique not null,
    name text not null,
    primary_category text not null, -- 'WORK', 'CREATE', 'MEET', 'HOST'
    description text default '',
    icon text default '',
    display_order integer default 0,
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- Seed Space Categories
insert into public.space_categories (code, name, primary_category, description, display_order)
values
    ('coworking_desks', 'Coworking Hot Desks', 'WORK', 'Flexible high-speed desk workspaces', 1),
    ('private_offices', 'Private Executive Offices', 'WORK', 'Enclosed private offices for teams & executives', 2),
    ('podcast_studios', 'Acoustic Podcast Studios', 'CREATE', 'Soundproof studios equipped with Shure microphones', 3),
    ('content_studios', 'Content & Creator Studios', 'CREATE', 'Lighting grids, green screens, and 4K cameras', 4),
    ('photography_studios', 'Photography Studios', 'CREATE', 'Cyclorama wall, strobe lights, and seamless backdrops', 5),
    ('video_studios', 'Video Production Suites', 'CREATE', 'Multi-cam broadcast and livestream stages', 6),
    ('meeting_rooms', 'Meeting Rooms', 'MEET', 'Screen-sharing, 4K displays and conference phones', 7),
    ('boardrooms', 'Executive Boardrooms', 'MEET', 'Premium corporate boardroom environments', 8),
    ('training_rooms', 'Training Rooms & Halls', 'MEET', 'Classroom setups with projectors & sound systems', 9),
    ('event_spaces', 'Event & Launch Spaces', 'HOST', 'Versatile venues for tech meetups, mixers and demos', 10),
    ('workshop_spaces', 'Workshop Spaces', 'HOST', 'Flexible layouts for hands-on masterclasses', 11)
on conflict (code) do update set
    name = excluded.name,
    primary_category = excluded.primary_category,
    description = excluded.description,
    display_order = excluded.display_order;

-- ==============================================================================
-- 5. SPACE AMENITIES TAXONOMY
-- ==============================================================================
create table if not exists public.space_amenities (
    id uuid primary key default gen_random_uuid(),
    code text unique not null,
    name text not null,
    category text not null default 'general',
    icon text default '',
    description text default '',
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- Seed Space Amenities (Nigerian Marketplace Essentials)
insert into public.space_amenities (code, name, category, description)
values
    ('power_247', '24/7 Redundant Power & Solar Inverter', 'power', 'Uninterrupted power backed by generator and solar inverter systems'),
    ('starlink_wifi', 'Starlink 250Mbps Low-Latency WiFi', 'connectivity', 'Ultra-fast satellite fiber-grade internet for video calls and uploads'),
    ('dual_inverter_ac', 'Dual Inverter Air Conditioning', 'comfort', 'Quiet climate-controlled cool workspace throughout working hours'),
    ('soundproofing', 'Acoustic Soundproofing', 'production', 'Professional sound absorption for clear voice recordings and privacy'),
    ('4k_displays', 'Dual 4K LG USB-C Displays', 'production', 'Plug-and-play monitor workstations for laptops'),
    ('mesh_chairs', 'Herman Miller / Ergonomic Mesh Chairs', 'comfort', 'Lumbar-supported seating for full-day work posture'),
    ('standing_desks', 'Motorized Height-Adjustable Desks', 'comfort', 'Sit-to-stand motorized desks with memory presets'),
    ('espresso_bar', 'Tea & Espresso Bar', 'hospitality', 'Complimentary fresh ground coffee, specialty teas and chilled water'),
    ('phone_booths', 'Private Acoustic Phone Booths', 'comfort', 'Private sound-isolated booths for sensitive calls'),
    ('secure_parking', 'Secure Gated Parking & Security', 'comfort', '24/7 guarded parking with CCTV monitoring'),
    ('reception_service', 'Front Desk & Guest Reception', 'hospitality', 'Professional reception staff to welcome clients and visitors')
on conflict (code) do update set
    name = excluded.name,
    category = excluded.category,
    description = excluded.description;

-- ==============================================================================
-- 6. SPACES TABLE (Core Marketplace Listings)
-- Note: wifi_pass & door_pin credentials are protected in space_access_credentials
-- ==============================================================================
create table if not exists public.spaces (
    id uuid primary key default gen_random_uuid(),
    host_id uuid not null references public.profiles(id) on delete cascade,
    owner_id uuid references public.profiles(id) on delete cascade,
    listing_id text unique,
    name text not null,
    tagline text default '',
    description text default '',
    
    space_type text not null default 'coworking_space',
    primary_category text not null default 'WORK',
    subcategory text not null default 'coworking_desks',
    
    -- Location & Geography (Nigerian Cities Supported)
    location text not null default 'Lagos, Nigeria',
    city text not null default 'Lagos',
    state text not null default 'Lagos State',
    country text not null default 'Nigeria',
    address text not null default '',
    neighborhood text default '',
    latitude double precision not null default 6.435,
    longitude double precision not null default 3.440,
    
    -- Capacity & Pricing in NGN / USD
    capacity integer not null default 10 check (capacity >= 1),
    hourly_price numeric not null default 5000 check (hourly_price >= 0),
    daily_price numeric not null default 25000 check (daily_price >= 0),
    weekly_price numeric not null default 110000 check (weekly_price >= 0),
    monthly_price numeric not null default 420000 check (monthly_price >= 0),
    
    hourly_rate_ngn numeric not null default 5000 check (hourly_rate_ngn >= 0),
    daily_rate_ngn numeric not null default 25000 check (daily_rate_ngn >= 0),
    weekly_rate_ngn numeric not null default 110000 check (weekly_rate_ngn >= 0),
    monthly_rate_ngn numeric not null default 420000 check (monthly_rate_ngn >= 0),
    hourly_rate_usd numeric default 3.5,
    daily_rate_usd numeric default 18.0,
    
    -- Amenities & Facilities (Public Listing Data)
    amenities jsonb not null default '["24/7 Redundant Power", "Starlink 250Mbps WiFi", "Dual Inverter AC", "Tea & Espresso Bar"]'::jsonb,
    equipment jsonb default '["4K USB-C Displays", "Acoustic Soundproofing"]'::jsonb,
    rules text[] default array['Valid ID required at reception', 'Keep calls inside phone booths', 'No smoking within indoor areas'],
    images text[] not null default array['https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80'],
    opening_hours text default '08:00 AM - 08:00 PM (Mon - Sat)',
    cancellation_policy text default 'Flexible: Free cancellation up to 2 hours before booking start time',
    
    -- Public WiFi SSID (Password & Door PIN are stored separately in space_access_credentials)
    wifi_ssid text default 'OFIS_Guest_HighSpeed',
    
    -- Status & Verification
    status text not null default 'available',
    availability_status text not null default 'available',
    verified boolean not null default true,
    verification_status verification_status_type not null default 'verified',
    rating numeric(3, 2) not null default 5.0 check (rating >= 1.0 and rating <= 5.0),
    review_count integer not null default 0 check (review_count >= 0),
    is_featured boolean default false,
    instant_book boolean default true,
    quiet_level text default 'High',
    
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Keep owner_id and host_id in sync, and synchronize pricing fields
create or replace function public.sync_space_fields()
returns trigger as $$
begin
    if new.host_id is not null and new.owner_id is null then
        new.owner_id := new.host_id;
    elsif new.owner_id is not null and new.host_id is null then
        new.host_id := new.owner_id;
    end if;

    if new.hourly_price is not null and (new.hourly_rate_ngn is null or new.hourly_rate_ngn = 0) then
        new.hourly_rate_ngn := new.hourly_price;
    elsif new.hourly_rate_ngn is not null then
        new.hourly_price := new.hourly_rate_ngn;
    end if;

    if new.daily_price is not null and (new.daily_rate_ngn is null or new.daily_rate_ngn = 0) then
        new.daily_rate_ngn := new.daily_price;
    elsif new.daily_rate_ngn is not null then
        new.daily_price := new.daily_rate_ngn;
    end if;

    new.updated_at := timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_sync_space_fields on public.spaces;
create trigger trg_sync_space_fields
    before insert or update on public.spaces
    for each row execute function public.sync_space_fields();

-- ==============================================================================
-- 7. SPACE ACCESS CREDENTIALS (Protected Secret Table)
-- Strictly accessible only by the Space Host or Authenticated Bookers with Active Bookings
-- ==============================================================================
create table if not exists public.space_access_credentials (
    space_id uuid primary key references public.spaces(id) on delete cascade,
    wifi_ssid text default 'OFIS_Guest_HighSpeed',
    wifi_pass text not null default 'WorkFocus2026',
    door_pin text not null default '4829',
    access_instructions text default 'Check in at reception with valid ID and quote your booking reference.',
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. SPACE IMAGES TABLE
-- ==============================================================================
create table if not exists public.space_images (
    id uuid primary key default gen_random_uuid(),
    space_id uuid not null references public.spaces(id) on delete cascade,
    image_url text not null,
    caption text default '',
    display_order integer not null default 0,
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- ==============================================================================
-- 9. AVAILABILITY TABLE
-- ==============================================================================
create table if not exists public.availability (
    id uuid primary key default gen_random_uuid(),
    space_id uuid not null references public.spaces(id) on delete cascade,
    date date not null,
    start_time time not null default '08:00:00',
    end_time time not null default '20:00:00',
    available boolean not null default true,
    created_at timestamptz not null default timezone('utc'::text, now()),
    constraint unique_space_date_time unique (space_id, date, start_time, end_time),
    constraint valid_availability_interval check (end_time > start_time)
);

-- ==============================================================================
-- 10. DESKS / WORKSTATIONS TABLE
-- Includes composite unique constraint to enforce relational desk ownership
-- ==============================================================================
create table if not exists public.desks (
    id uuid primary key default gen_random_uuid(),
    space_id uuid not null references public.spaces(id) on delete cascade,
    name text not null,
    code text not null,
    row_num integer not null default 1,
    col_num integer not null default 1,
    zone text not null default 'collaborative',
    status text not null default 'available',
    features text[] default array['Ergonomic Mesh Chair', 'Dedicated Multi-Socket Power', 'High-Speed LAN'],
    monitor_setup text default 'Dual 27" 4K USB-C Displays',
    chair_type text default 'Herman Miller Aeron',
    standing_motorized boolean default false,
    has_power_outlet boolean default true,
    has_lan_cable boolean default true,
    daylight_rating integer default 5,
    noise_level text default 'Gentle ambient',
    current_occupant jsonb default null,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    constraint unique_space_desk_code unique (space_id, code),
    constraint unique_desk_space_id unique (id, space_id)
);

-- ==============================================================================
-- 11. BOOKINGS TABLE (Authoritative Booking State & Ledger)
-- Protected by Composite Foreign Keys, Exclusion Constraints & Security Triggers
-- ==============================================================================
create table if not exists public.bookings (
    id uuid primary key default gen_random_uuid(),
    booking_reference text unique not null,
    space_id uuid not null references public.spaces(id) on delete restrict,
    client_id uuid not null references public.profiles(id) on delete restrict,
    user_id uuid references public.profiles(id) on delete restrict,
    host_id uuid not null references public.profiles(id) on delete restrict,
    desk_id uuid,
    
    -- Composite foreign key guarantees that desk_id strictly belongs to space_id
    constraint fk_booking_desk_space foreign key (desk_id, space_id)
        references public.desks(id, space_id) on delete set null,
    
    -- Datetime and Labels
    start_datetime timestamptz not null,
    end_datetime timestamptz not null,
    start_time timestamptz,
    end_time timestamptz,
    start_date text not null,
    end_date text not null,
    start_time_label text not null,
    end_time_label text not null,
    duration_type text not null default 'hourly',
    duration_units integer not null default 1 check (duration_units >= 1),
    
    -- Status & Financials (Authoritative NGN Ledger)
    booking_status booking_status_type not null default 'pending',
    status text not null default 'pending',
    payment_status text not null default 'pending',
    payment_method text not null default 'paystack',
    payment_reference text,
    transaction_id text not null,
    
    currency text not null default 'NGN',
    currency_symbol text not null default '₦',
    base_amount numeric not null default 0 check (base_amount >= 0),
    platform_commission_fee numeric not null default 0 check (platform_commission_fee >= 0),
    commission_rate numeric not null default 0.05,
    taxes numeric not null default 0 check (taxes >= 0),
    total_amount numeric not null default 0 check (total_amount >= 0),
    host_net_payout numeric not null default 0 check (host_net_payout >= 0),
    
    -- Access Snapshots & Notes
    wifi_ssid text default 'OFIS_Guest_HighSpeed',
    wifi_pass text default 'WorkFocus2026',
    door_pin text default '4829',
    qr_code_url text not null default '',
    notes text default '',
    
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    
    constraint valid_booking_interval check (end_datetime > start_datetime)
);

-- ==============================================================================
-- 12. DOUBLE-BOOKING CONCURRENCY PROTECTION (PostgreSQL GiST Exclusions & Advisory Locks)
-- Guarantees [) interval semantics and blocks concurrent race conditions
-- ==============================================================================

-- 12a. Desk-Level Exclusion Constraint (No two bookings can take the same desk during overlapping [) intervals)
alter table public.bookings drop constraint if exists exclude_overlapping_desk_bookings;
alter table public.bookings add constraint exclude_overlapping_desk_bookings
    exclude using gist (
        space_id with =,
        desk_id with =,
        tstzrange(start_datetime, end_datetime, '[)') with &&
    )
    where (desk_id is not null and booking_status in ('confirmed', 'checked_in', 'pending', 'payment_pending'));

-- 12b. Whole-Space Exclusion Constraint (No two whole-space bookings can overlap)
alter table public.bookings drop constraint if exists exclude_overlapping_whole_space_bookings;
alter table public.bookings add constraint exclude_overlapping_whole_space_bookings
    exclude using gist (
        space_id with =,
        tstzrange(start_datetime, end_datetime, '[)') with &&
    )
    where (desk_id is null and booking_status in ('confirmed', 'checked_in', 'pending', 'payment_pending'));

-- 12c. Transactional Lock & Cross-Overlap Validation Trigger
-- Prevents race conditions and ensures a whole-space booking blocks desk bookings and vice-versa
create or replace function public.enforce_no_booking_overlap()
returns trigger as $$
declare
    v_conflict_count integer;
begin
    if new.booking_status not in ('confirmed', 'checked_in', 'pending', 'payment_pending') then
        return new;
    end if;

    -- Transaction-level advisory lock serializes concurrent bookings on the same physical space
    perform pg_advisory_xact_lock(hashtext(new.space_id::text));

    if new.desk_id is null then
        -- Whole-space reservation: ensure NO desk or space booking overlaps
        select count(*) into v_conflict_count
        from public.bookings
        where space_id = new.space_id
          and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
          and booking_status in ('confirmed', 'checked_in', 'pending', 'payment_pending')
          and tstzrange(start_datetime, end_datetime, '[)') && tstzrange(new.start_datetime, new.end_datetime, '[)');
    else
        -- Desk-specific reservation: ensure the whole space is NOT booked during this window
        select count(*) into v_conflict_count
        from public.bookings
        where space_id = new.space_id
          and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
          and desk_id is null
          and booking_status in ('confirmed', 'checked_in', 'pending', 'payment_pending')
          and tstzrange(start_datetime, end_datetime, '[)') && tstzrange(new.start_datetime, new.end_datetime, '[)');
    end if;

    if v_conflict_count > 0 then
        raise exception 'Scheduling Conflict: This workspace is already reserved for the selected timeframe (% to %)', new.start_datetime, new.end_datetime;
    end if;

    return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_enforce_no_booking_overlap on public.bookings;
create trigger trg_enforce_no_booking_overlap
    before insert or update on public.bookings
    for each row execute function public.enforce_no_booking_overlap();

-- ==============================================================================
-- 13. AUTHORITATIVE BOOKING SECURITY & PRICING ENGINE
-- Enforces:
--  - Authoritative amount calculation from database space rates
--  - Safe pending initialization on client insert
--  - Sync between duplicated fields (client_id/user_id, status/booking_status, start_datetime/start_time)
--  - Credential snapshotting from protected space_access_credentials
-- ==============================================================================
create or replace function public.enforce_booking_security_and_pricing()
returns trigger as $$
declare
    v_space public.spaces%rowtype;
    v_creds public.space_access_credentials%rowtype;
    v_is_admin boolean;
    v_unit_rate numeric;
    v_base numeric;
    v_commission numeric;
    v_tax numeric;
    v_total numeric;
    v_payout numeric;
begin
    -- 1. Verify space existence
    select * into v_space from public.spaces where id = new.space_id;
    if not found then
        raise exception 'Invalid space_id: referenced space does not exist';
    end if;

    -- 2. Strictly bind host_id to the verified space owner
    new.host_id := coalesce(v_space.host_id, v_space.owner_id);

    -- 3. Check caller admin status
    select (role = 'admin') into v_is_admin from public.profiles where id = auth.uid();

    -- 4. Enforce client identity & initial status for normal user calls
    if coalesce(v_is_admin, false) is distinct from true and auth.role() != 'service_role' then
        if auth.uid() is not null then
            new.client_id := auth.uid();
            new.user_id := auth.uid();
        end if;

        if tg_op = 'INSERT' then
            -- Clients must always start in a pending state until payment verification
            new.booking_status := 'pending';
            new.status := 'pending';
            new.payment_status := 'pending';
        end if;
    end if;

    -- 5. Field Synchronization
    if new.client_id is not null and new.user_id is null then
        new.user_id := new.client_id;
    elsif new.user_id is not null and new.client_id is null then
        new.client_id := new.user_id;
    end if;

    if new.start_datetime is not null then
        new.start_time := new.start_datetime;
    end if;
    if new.end_datetime is not null then
        new.end_time := new.end_datetime;
    end if;

    if new.booking_status is not null then
        new.status := new.booking_status::text;
    elsif new.status is not null then
        new.booking_status := new.status::booking_status_type;
    end if;

    -- 6. Authoritative Database-Driven Pricing Calculation
    if new.duration_type = 'daily' then
        v_unit_rate := coalesce(v_space.daily_price, v_space.daily_rate_ngn, 25000);
    elsif new.duration_type = 'weekly' then
        v_unit_rate := coalesce(v_space.weekly_price, v_space.weekly_rate_ngn, 110000);
    elsif new.duration_type = 'monthly' then
        v_unit_rate := coalesce(v_space.monthly_price, v_space.monthly_rate_ngn, 420000);
    else -- hourly
        v_unit_rate := coalesce(v_space.hourly_price, v_space.hourly_rate_ngn, 5000);
    end if;

    v_base := greatest(new.duration_units, 1) * v_unit_rate;
    v_commission := round(v_base * 0.05, 2);
    v_tax := round(v_base * 0.075, 2); -- 7.5% Nigerian VAT
    v_total := v_base + v_commission + v_tax;
    v_payout := v_base - v_commission;

    new.currency := 'NGN';
    new.currency_symbol := '₦';
    new.base_amount := v_base;
    new.commission_rate := 0.05;
    new.platform_commission_fee := v_commission;
    new.taxes := v_tax;
    new.total_amount := v_total;
    new.host_net_payout := v_payout;

    -- 7. Snapshot Credentials on Insert/Confirmation
    select * into v_creds from public.space_access_credentials where space_id = new.space_id;
    if found then
        new.wifi_ssid := coalesce(v_creds.wifi_ssid, v_space.wifi_ssid, 'OFIS_Guest_HighSpeed');
        new.wifi_pass := v_creds.wifi_pass;
        new.door_pin := v_creds.door_pin;
    end if;

    -- 8. References Generation
    if new.booking_reference is null or new.booking_reference = '' then
        new.booking_reference := 'OFS-' || upper(substr(coalesce(v_space.city, 'LOS'), 1, 3)) || '-' || floor(100000 + random() * 900000)::text;
    end if;

    if new.transaction_id is null or new.transaction_id = '' then
        new.transaction_id := 'txn_' || replace(gen_random_uuid()::text, '-', '');
    end if;

    new.updated_at := timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_enforce_booking_security_and_pricing on public.bookings;
create trigger trg_enforce_booking_security_and_pricing
    before insert or update on public.bookings
    for each row execute function public.enforce_booking_security_and_pricing();

-- Availability Checking Function
create or replace function public.check_space_availability(
    p_space_id uuid,
    p_desk_id uuid,
    p_start_datetime timestamptz,
    p_end_datetime timestamptz
)
returns boolean as $$
declare
    v_conflicts integer;
begin
    if p_desk_id is not null then
        select count(*)
        into v_conflicts
        from public.bookings
        where space_id = p_space_id
          and (desk_id = p_desk_id or desk_id is null)
          and booking_status in ('confirmed', 'checked_in', 'pending', 'payment_pending')
          and tstzrange(start_datetime, end_datetime, '[)') && tstzrange(p_start_datetime, p_end_datetime, '[)');
    else
        select count(*)
        into v_conflicts
        from public.bookings
        where space_id = p_space_id
          and booking_status in ('confirmed', 'checked_in', 'pending', 'payment_pending')
          and tstzrange(start_datetime, end_datetime, '[)') && tstzrange(p_start_datetime, p_end_datetime, '[)');
    end if;

    return (v_conflicts = 0);
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- ==============================================================================
-- 14. BOOKING SLOTS TABLE
-- ==============================================================================
create table if not exists public.booking_slots (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references public.bookings(id) on delete cascade,
    space_id uuid not null references public.spaces(id) on delete cascade,
    desk_id uuid references public.desks(id) on delete set null,
    slot_start timestamptz not null,
    slot_end timestamptz not null,
    unit_price numeric not null default 0 check (unit_price >= 0),
    created_at timestamptz not null default timezone('utc'::text, now()),
    constraint valid_slot_interval check (slot_end > slot_start)
);

-- ==============================================================================
-- 15. PAYMENTS TABLE & PAYMENT INTEGRITY ENGINE
-- Prevents fabrication of successful payments or unauthorized ledger entries
-- ==============================================================================
create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references public.bookings(id) on delete restrict,
    user_id uuid not null references public.profiles(id) on delete restrict,
    transaction_reference text unique not null,
    external_reference text,
    amount numeric not null check (amount >= 0),
    currency text not null default 'NGN',
    provider text not null default 'paystack', -- 'paystack', 'flutterwave', 'bank_transfer'
    channel text default 'card',
    payment_status payment_status_type not null default 'pending',
    paid_at timestamptz not null default timezone('utc'::text, now()),
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Payment Integrity Trigger
create or replace function public.enforce_payment_integrity()
returns trigger as $$
declare
    v_booking public.bookings%rowtype;
    v_is_admin boolean;
begin
    -- 1. Verify that booking exists
    select * into v_booking from public.bookings where id = new.booking_id;
    if not found then
        raise exception 'Referenced booking does not exist';
    end if;

    -- 2. Verify caller status
    select (role = 'admin') into v_is_admin from public.profiles where id = auth.uid();

    if coalesce(v_is_admin, false) is distinct from true and auth.role() != 'service_role' then
        -- User ID must match booking customer
        if auth.uid() is not null and new.user_id is distinct from auth.uid() then
            raise exception 'Payment user_id must match authenticated user';
        end if;

        -- Amount must strictly match the authoritative booking total_amount
        if new.amount is distinct from v_booking.total_amount then
            new.amount := v_booking.total_amount;
        end if;

        -- Direct client inserts cannot mark payment as successful (must go through verification RPC or webhook)
        if tg_op = 'INSERT' and new.payment_status != 'pending' then
            new.payment_status := 'pending';
        end if;

        if tg_op = 'UPDATE' and new.payment_status = 'successful' and old.payment_status != 'successful' then
            raise exception 'Direct client state escalation to successful is prohibited';
        end if;
    end if;

    new.updated_at := timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_enforce_payment_integrity on public.payments;
create trigger trg_enforce_payment_integrity
    before insert or update on public.payments
    for each row execute function public.enforce_payment_integrity();

-- Trusted Payment Confirmation Function (Executed upon verified webhook callback or authenticated checkout)
create or replace function public.confirm_booking_payment(
    p_booking_id uuid,
    p_transaction_reference text,
    p_provider text default 'paystack',
    p_amount numeric default null,
    p_metadata jsonb default '{}'::jsonb
)
returns jsonb as $$
declare
    v_booking public.bookings%rowtype;
    v_payment_id uuid;
begin
    select * into v_booking from public.bookings where id = p_booking_id;
    if not found then
        raise exception 'Booking not found';
    end if;

    -- Validate payment amount if supplied
    if p_amount is not null and p_amount < v_booking.total_amount then
        raise exception 'Supplied payment amount (%) is less than required total (%)', p_amount, v_booking.total_amount;
    end if;

    -- Upsert payment ledger entry
    insert into public.payments (
        booking_id,
        user_id,
        transaction_reference,
        amount,
        currency,
        provider,
        payment_status,
        metadata,
        paid_at
    )
    values (
        v_booking.id,
        v_booking.client_id,
        p_transaction_reference,
        v_booking.total_amount,
        v_booking.currency,
        p_provider,
        'successful'::payment_status_type,
        p_metadata,
        timezone('utc'::text, now())
    )
    on conflict (transaction_reference) do update set
        payment_status = 'successful'::payment_status_type,
        updated_at = timezone('utc'::text, now())
    returning id into v_payment_id;

    -- Update authoritative booking status to confirmed
    update public.bookings
    set
        booking_status = 'confirmed'::booking_status_type,
        status = 'confirmed',
        payment_status = 'successful',
        payment_reference = p_transaction_reference,
        updated_at = timezone('utc'::text, now())
    where id = v_booking.id;

    -- Dispatch confirmation notification
    insert into public.notifications (user_id, type, title, message)
    values
        (v_booking.client_id, 'booking', 'Booking Confirmed!', 'Your booking (' || v_booking.booking_reference || ') is confirmed.'),
        (v_booking.host_id, 'booking', 'New Confirmed Booking', 'You have a new confirmed booking (' || v_booking.booking_reference || ').');

    return jsonb_build_object(
        'success', true,
        'booking_id', v_booking.id,
        'booking_reference', v_booking.booking_reference,
        'payment_id', v_payment_id,
        'status', 'confirmed'
    );
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- ==============================================================================
-- 16. FAVOURITES TABLE
-- ==============================================================================
create table if not exists public.favourites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    space_id uuid not null references public.spaces(id) on delete cascade,
    created_at timestamptz not null default timezone('utc'::text, now()),
    constraint unique_user_space_favourite unique (user_id, space_id)
);

-- Compatibility view for American/British spelling
create or replace view public.favorites as 
select id, user_id, space_id, created_at from public.favourites;

-- ==============================================================================
-- 17. REVIEWS & VERIFIED STAY INTEGRITY ENGINE
-- Enforces:
--  - Requires a legitimate completed/checked-in booking owned by the author
--  - Space ID must match the booking's space
--  - Exactly 1 review per booking (no unlimited spam)
-- ==============================================================================
create table if not exists public.reviews (
    id uuid primary key default gen_random_uuid(),
    space_id uuid not null references public.spaces(id) on delete cascade,
    client_id uuid not null references public.profiles(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    booking_id uuid not null references public.bookings(id) on delete cascade,
    rating numeric(3, 2) not null check (rating >= 1.0 and rating <= 5.0),
    
    -- Sub-ratings (1-5)
    cleanliness numeric(2, 1) default 5.0 check (cleanliness >= 1.0 and cleanliness <= 5.0),
    wifi_speed numeric(2, 1) default 5.0 check (wifi_speed >= 1.0 and wifi_speed <= 5.0),
    noise_comfort numeric(2, 1) default 5.0 check (noise_comfort >= 1.0 and noise_comfort <= 5.0),
    ergonomics numeric(2, 1) default 5.0 check (ergonomics >= 1.0 and ergonomics <= 5.0),
    amenities_rating numeric(2, 1) default 5.0 check (amenities_rating >= 1.0 and amenities_rating <= 5.0),
    
    title text not null default 'Verified Stay Experience',
    comment text not null,
    desk_code text default '',
    desk_name text default '',
    is_verified_stay boolean not null default true,
    helpful_count integer not null default 0 check (helpful_count >= 0),
    helpful_user_ids uuid[] default array[]::uuid[],
    host_reply jsonb default null,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    constraint unique_review_per_booking unique (booking_id)
);

-- Review Integrity Verification Trigger
create or replace function public.enforce_review_integrity()
returns trigger as $$
declare
    v_booking public.bookings%rowtype;
    v_is_admin boolean;
begin
    if new.booking_id is null then
        raise exception 'A valid completed booking_id is required to submit a review';
    end if;

    select * into v_booking from public.bookings where id = new.booking_id;
    if not found then
        raise exception 'Referenced booking not found';
    end if;

    select (role = 'admin') into v_is_admin from public.profiles where id = auth.uid();

    if coalesce(v_is_admin, false) is distinct from true and auth.role() != 'service_role' then
        -- Reviewer must be the client who made the booking
        if v_booking.client_id is distinct from auth.uid() and v_booking.user_id is distinct from auth.uid() then
            raise exception 'You can only review workspaces for your own completed bookings';
        end if;

        -- Space ID must match the booking's space
        if v_booking.space_id is distinct from new.space_id then
            raise exception 'Review space_id must match the booked space';
        end if;

        -- Booking must be in a completed or checked-in state
        if v_booking.booking_status not in ('completed', 'checked_in', 'confirmed') then
            raise exception 'You can only review a space after your booking has taken place';
        end if;

        new.client_id := auth.uid();
        new.user_id := auth.uid();
        new.is_verified_stay := true;
        -- Prevent manual manipulation of helpful_count during insert
        if tg_op = 'INSERT' then
            new.helpful_count := 0;
            new.helpful_user_ids := array[]::uuid[];
        end if;
    end if;

    if new.client_id is not null and new.user_id is null then
        new.user_id := new.client_id;
    end if;

    new.updated_at := timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_enforce_review_integrity on public.reviews;
create trigger trg_enforce_review_integrity
    before insert or update on public.reviews
    for each row execute function public.enforce_review_integrity();

-- ==============================================================================
-- 18. REVIEW HELPFUL VOTES TABLE & VOTE AGGREGATION
-- Eliminates direct client manipulation of helpful_count
-- ==============================================================================
create table if not exists public.review_helpful_votes (
    id uuid primary key default gen_random_uuid(),
    review_id uuid not null references public.reviews(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz not null default timezone('utc'::text, now()),
    constraint unique_review_user_vote unique (review_id, user_id)
);

-- Vote counter maintenance trigger
create or replace function public.sync_review_helpful_count()
returns trigger as $$
begin
    if tg_op = 'INSERT' then
        update public.reviews
        set
            helpful_count = (select count(*) from public.review_helpful_votes where review_id = new.review_id),
            helpful_user_ids = array_append(coalesce(helpful_user_ids, array[]::uuid[]), new.user_id)
        where id = new.review_id;
    elsif tg_op = 'DELETE' then
        update public.reviews
        set
            helpful_count = (select count(*) from public.review_helpful_votes where review_id = old.review_id),
            helpful_user_ids = array_remove(coalesce(helpful_user_ids, array[]::uuid[]), old.user_id)
        where id = old.review_id;
    end if;
    return null;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_sync_review_helpful_count on public.review_helpful_votes;
create trigger trg_sync_review_helpful_count
    after insert or delete on public.review_helpful_votes
    for each row execute function public.sync_review_helpful_count();

-- ==============================================================================
-- 19. NOTIFICATIONS TABLE
-- ==============================================================================
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    type text not null default 'booking',
    title text not null,
    message text not null,
    read boolean not null default false,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- ==============================================================================
-- 20. HOST & SPACE VERIFICATION RECORDS TABLE
-- Protected: hosts can submit documents, but only admins can approve/verify
-- ==============================================================================
create table if not exists public.host_verification (
    id uuid primary key default gen_random_uuid(),
    host_id uuid not null references public.profiles(id) on delete cascade,
    space_id uuid references public.spaces(id) on delete set null,
    verification_status verification_status_type not null default 'pending',
    verification_type text not null default 'cac_business',
    business_name text,
    cac_rc_number text,
    id_document_url text,
    utility_bill_url text,
    space_ownership_proof_url text,
    admin_notes text default '',
    submitted_at timestamptz not null default timezone('utc'::text, now()),
    reviewed_at timestamptz,
    reviewed_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Host Verification Security Shield: Enforces admin-only verification decisions
create or replace function public.enforce_host_verification_security()
returns trigger as $$
declare
    v_is_admin boolean;
begin
    select (role = 'admin') into v_is_admin from public.profiles where id = auth.uid();

    if tg_op = 'INSERT' then
        if coalesce(v_is_admin, false) is distinct from true and auth.role() != 'service_role' then
            new.host_id := auth.uid();
            new.verification_status := 'pending';
            new.reviewed_at := null;
            new.reviewed_by := null;
            new.admin_notes := '';
        end if;
    elsif tg_op = 'UPDATE' then
        if coalesce(v_is_admin, false) is distinct from true and auth.role() != 'service_role' then
            -- Non-admin cannot alter verification status or review fields
            new.verification_status := old.verification_status;
            new.reviewed_at := old.reviewed_at;
            new.reviewed_by := old.reviewed_by;
            new.admin_notes := old.admin_notes;
        else
            -- If admin marks verified, automatically update profile and spaces
            if new.verification_status = 'verified' and old.verification_status != 'verified' then
                update public.profiles
                set verification_status = 'verified', is_superhost = true
                where id = new.host_id;

                if new.space_id is not null then
                    update public.spaces
                    set verified = true, verification_status = 'verified'
                    where id = new.space_id;
                end if;
            end if;
        end if;
    end if;

    new.updated_at := timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_enforce_host_verification_security on public.host_verification;
create trigger trg_enforce_host_verification_security
    before insert or update on public.host_verification
    for each row execute function public.enforce_host_verification_security();

-- ==============================================================================
-- 21. SECURE SPACE CREDENTIALS RPC
-- Delivers WiFi Passwords & Door PINs strictly to authorized Hosts and Active Bookers
-- ==============================================================================
create table if not exists public.space_access_credentials (
    space_id uuid primary key references public.spaces(id) on delete cascade,
    wifi_ssid text default 'OFIS_Guest_HighSpeed',
    wifi_pass text not null default 'WorkFocus2026',
    door_pin text not null default '4829',
    access_instructions text default 'Check in at reception with valid ID and quote your booking reference.',
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

create or replace function public.get_space_access_credentials(
    p_space_id uuid,
    p_booking_id uuid default null
)
returns jsonb as $$
declare
    v_space public.spaces%rowtype;
    v_creds public.space_access_credentials%rowtype;
    v_has_access boolean := false;
    v_is_admin boolean := false;
begin
    if auth.uid() is null then
        raise exception 'Authentication required to retrieve access credentials';
    end if;

    select * into v_space from public.spaces where id = p_space_id;
    if not found then
        raise exception 'Space not found';
    end if;

    -- 1. Space Owner Check
    if v_space.host_id = auth.uid() or v_space.owner_id = auth.uid() then
        v_has_access := true;
    end if;

    -- 2. Admin Check
    if not v_has_access then
        select (role = 'admin') into v_is_admin from public.profiles where id = auth.uid();
        if coalesce(v_is_admin, false) = true then
            v_has_access := true;
        end if;
    end if;

    -- 3. Active / Valid Booking Check
    if not v_has_access then
        if p_booking_id is not null then
            select exists (
                select 1 from public.bookings
                where id = p_booking_id
                  and space_id = p_space_id
                  and (client_id = auth.uid() or user_id = auth.uid())
                  and booking_status in ('confirmed', 'checked_in')
                  and end_datetime >= (now() - interval '2 hours')
            ) into v_has_access;
        else
            select exists (
                select 1 from public.bookings
                where space_id = p_space_id
                  and (client_id = auth.uid() or user_id = auth.uid())
                  and booking_status in ('confirmed', 'checked_in')
                  and end_datetime >= (now() - interval '2 hours')
            ) into v_has_access;
        end if;
    end if;

    if not v_has_access then
        raise exception 'Access Denied: You must have a confirmed booking for this space to view WiFi and Door credentials';
    end if;

    select * into v_creds from public.space_access_credentials where space_id = p_space_id;
    if not found then
        return jsonb_build_object(
            'space_id', p_space_id,
            'wifi_ssid', coalesce(v_space.wifi_ssid, 'OFIS_Guest_HighSpeed'),
            'wifi_pass', 'WorkFocus2026',
            'door_pin', '4829',
            'access_instructions', 'Check in at reception with your booking reference.'
        );
    end if;

    return jsonb_build_object(
        'space_id', p_space_id,
        'wifi_ssid', v_creds.wifi_ssid,
        'wifi_pass', v_creds.wifi_pass,
        'door_pin', v_creds.door_pin,
        'access_instructions', v_creds.access_instructions
    );
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- ==============================================================================
-- 22. PERFORMANCE & SECURITY INDEXES
-- ==============================================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_spaces_host_id on public.spaces(host_id);
create index if not exists idx_spaces_city_state on public.spaces(city, state);
create index if not exists idx_spaces_location_lower on public.spaces(lower(city), lower(state));
create index if not exists idx_spaces_category on public.spaces(primary_category, subcategory);
create index if not exists idx_spaces_verified_status on public.spaces(verified, status);
create index if not exists idx_spaces_pricing_ngn on public.spaces(hourly_price, daily_price);
create index if not exists idx_spaces_rating on public.spaces(rating desc);

create index if not exists idx_desks_space_id on public.desks(space_id, status);
create index if not exists idx_availability_space_date on public.availability(space_id, date, available);

create index if not exists idx_bookings_client_id on public.bookings(client_id);
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_host_id on public.bookings(host_id);
create index if not exists idx_bookings_space_id on public.bookings(space_id);
create index if not exists idx_bookings_reference on public.bookings(booking_reference);
create index if not exists idx_bookings_active_schedule on public.bookings(space_id, start_datetime, end_datetime)
    where booking_status in ('confirmed', 'checked_in', 'pending', 'payment_pending');

create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_reference on public.payments(transaction_reference);

create index if not exists idx_favourites_user_id on public.favourites(user_id);
create index if not exists idx_favourites_space_id on public.favourites(space_id);

create index if not exists idx_reviews_space_id on public.reviews(space_id);
create index if not exists idx_reviews_booking_id on public.reviews(booking_id);
create index if not exists idx_review_helpful_votes_rev_usr on public.review_helpful_votes(review_id, user_id);

create index if not exists idx_notifications_user_unread on public.notifications(user_id, read, created_at desc);
create index if not exists idx_host_verification_status on public.host_verification(host_id, verification_status);

-- ==============================================================================
-- 23. ROW LEVEL SECURITY (RLS) - HARDENED ON EVERY TABLE
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.space_categories enable row level security;
alter table public.space_amenities enable row level security;
alter table public.spaces enable row level security;
alter table public.space_access_credentials enable row level security;
alter table public.space_images enable row level security;
alter table public.availability enable row level security;
alter table public.desks enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_slots enable row level security;
alter table public.payments enable row level security;
alter table public.favourites enable row level security;
alter table public.reviews enable row level security;
alter table public.review_helpful_votes enable row level security;
alter table public.notifications enable row level security;
alter table public.host_verification enable row level security;

-- ------------------------------------------------------------------------------
-- TAXONOMIES RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Categories viewable by everyone" on public.space_categories;
create policy "Categories viewable by everyone" on public.space_categories for select using (true);

drop policy if exists "Amenities viewable by everyone" on public.space_amenities;
create policy "Amenities viewable by everyone" on public.space_amenities for select using (true);

-- ------------------------------------------------------------------------------
-- PROFILES RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- SPACES RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Published spaces are viewable by everyone" on public.spaces;
create policy "Published spaces are viewable by everyone" on public.spaces for select
    using (status != 'archived' or auth.uid() = host_id or auth.uid() = owner_id);

drop policy if exists "Hosts can insert spaces" on public.spaces;
create policy "Hosts can insert spaces" on public.spaces for insert
    with check (auth.uid() = host_id or auth.uid() = owner_id);

drop policy if exists "Hosts can update their own spaces" on public.spaces;
create policy "Hosts can update their own spaces" on public.spaces for update
    using (auth.uid() = host_id or auth.uid() = owner_id);

drop policy if exists "Hosts can delete their own spaces" on public.spaces;
create policy "Hosts can delete their own spaces" on public.spaces for delete
    using (auth.uid() = host_id or auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- SPACE ACCESS CREDENTIALS RLS (Secret Credentials)
-- ------------------------------------------------------------------------------
drop policy if exists "Access credentials viewable by space host and active bookers" on public.space_access_credentials;
create policy "Access credentials viewable by space host and active bookers" on public.space_access_credentials for select
    using (
        exists (
            select 1 from public.spaces s
            where s.id = space_access_credentials.space_id
              and (s.host_id = auth.uid() or s.owner_id = auth.uid())
        )
        or exists (
            select 1 from public.bookings b
            where b.space_id = space_access_credentials.space_id
              and (b.client_id = auth.uid() or b.user_id = auth.uid())
              and b.booking_status in ('confirmed', 'checked_in')
              and b.end_datetime >= (now() - interval '2 hours')
        )
        or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
        )
    );

drop policy if exists "Space hosts can manage their credentials" on public.space_access_credentials;
create policy "Space hosts can manage their credentials" on public.space_access_credentials for all
    using (
        exists (
            select 1 from public.spaces s
            where s.id = space_access_credentials.space_id
              and (s.host_id = auth.uid() or s.owner_id = auth.uid())
        )
    );

-- ------------------------------------------------------------------------------
-- SPACE IMAGES RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Space images are viewable by everyone" on public.space_images;
create policy "Space images are viewable by everyone" on public.space_images for select using (true);

drop policy if exists "Hosts can manage images for their spaces" on public.space_images;
create policy "Hosts can manage images for their spaces" on public.space_images for all
    using (
        exists (
            select 1 from public.spaces
            where spaces.id = space_images.space_id
              and (spaces.host_id = auth.uid() or spaces.owner_id = auth.uid())
        )
    );

-- ------------------------------------------------------------------------------
-- AVAILABILITY RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Availability is viewable by everyone" on public.availability;
create policy "Availability is viewable by everyone" on public.availability for select using (true);

drop policy if exists "Hosts can manage availability for their spaces" on public.availability;
create policy "Hosts can manage availability for their spaces" on public.availability for all
    using (
        exists (
            select 1 from public.spaces
            where spaces.id = availability.space_id
              and (spaces.host_id = auth.uid() or spaces.owner_id = auth.uid())
        )
    );

-- ------------------------------------------------------------------------------
-- DESKS RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Desks are viewable by everyone" on public.desks;
create policy "Desks are viewable by everyone" on public.desks for select using (true);

drop policy if exists "Hosts can manage desks for their spaces" on public.desks;
create policy "Hosts can manage desks for their spaces" on public.desks for all
    using (
        exists (
            select 1 from public.spaces
            where spaces.id = desks.space_id
              and (spaces.host_id = auth.uid() or spaces.owner_id = auth.uid())
        )
    );

-- ------------------------------------------------------------------------------
-- BOOKINGS RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Users and Hosts can view their bookings" on public.bookings;
create policy "Users and Hosts can view their bookings" on public.bookings for select
    using (
        auth.uid() = client_id or auth.uid() = user_id or auth.uid() = host_id or
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

drop policy if exists "Clients can create bookings" on public.bookings;
create policy "Clients can create bookings" on public.bookings for insert
    with check (
        auth.uid() = client_id or auth.uid() = user_id
    );

drop policy if exists "Clients and Hosts can update their bookings" on public.bookings;
create policy "Clients and Hosts can update their bookings" on public.bookings for update
    using (
        auth.uid() = client_id or auth.uid() = user_id or auth.uid() = host_id or
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

-- ------------------------------------------------------------------------------
-- BOOKING SLOTS RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Booking slots are viewable by booking participants" on public.booking_slots;
create policy "Booking slots are viewable by booking participants" on public.booking_slots for select
    using (
        exists (
            select 1 from public.bookings
            where bookings.id = booking_slots.booking_id
              and (bookings.client_id = auth.uid() or bookings.user_id = auth.uid() or bookings.host_id = auth.uid())
        )
    );

-- ------------------------------------------------------------------------------
-- PAYMENTS RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Users and Hosts can view payments for their bookings" on public.payments;
create policy "Users and Hosts can view payments for their bookings" on public.payments for select
    using (
        auth.uid() = user_id or exists (
            select 1 from public.bookings
            where bookings.id = payments.booking_id
              and (bookings.host_id = auth.uid() or bookings.client_id = auth.uid() or bookings.user_id = auth.uid())
        )
    );

drop policy if exists "Authenticated users can create pending payments for their bookings" on public.payments;
create policy "Authenticated users can create pending payments for their bookings" on public.payments for insert
    with check (
        auth.uid() = user_id and
        exists (
            select 1 from public.bookings
            where bookings.id = payments.booking_id
              and (bookings.client_id = auth.uid() or bookings.user_id = auth.uid())
        )
    );

-- ------------------------------------------------------------------------------
-- FAVOURITES RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view their own favourites" on public.favourites;
create policy "Users can view their own favourites" on public.favourites for select using (auth.uid() = user_id);

drop policy if exists "Users can manage their own favourites" on public.favourites;
create policy "Users can manage their own favourites" on public.favourites for all using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- REVIEWS RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);

drop policy if exists "Clients can create verified reviews" on public.reviews;
create policy "Clients can create verified reviews" on public.reviews for insert
    with check (
        (auth.uid() = client_id or auth.uid() = user_id)
        and exists (
            select 1 from public.bookings
            where bookings.id = reviews.booking_id
              and (bookings.client_id = auth.uid() or bookings.user_id = auth.uid())
              and bookings.space_id = reviews.space_id
        )
    );

drop policy if exists "Review authors can update their reviews" on public.reviews;
create policy "Review authors can update their reviews" on public.reviews for update
    using (auth.uid() = client_id or auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- REVIEW HELPFUL VOTES RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Helpful votes are viewable by everyone" on public.review_helpful_votes;
create policy "Helpful votes are viewable by everyone" on public.review_helpful_votes for select using (true);

drop policy if exists "Users can submit their own helpful vote" on public.review_helpful_votes;
create policy "Users can submit their own helpful vote" on public.review_helpful_votes for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own helpful vote" on public.review_helpful_votes;
create policy "Users can remove their own helpful vote" on public.review_helpful_votes for delete
    using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications" on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications" on public.notifications for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own notifications" on public.notifications;
create policy "Users can delete their own notifications" on public.notifications for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- HOST VERIFICATION RLS
-- ------------------------------------------------------------------------------
drop policy if exists "Hosts can view their own verification" on public.host_verification;
create policy "Hosts can view their own verification" on public.host_verification for select
    using (
        auth.uid() = host_id or exists (
            select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );

drop policy if exists "Hosts can submit verification records" on public.host_verification;
create policy "Hosts can submit verification records" on public.host_verification for insert
    with check (auth.uid() = host_id);

drop policy if exists "Admins can update verification status" on public.host_verification;
create policy "Admins can update verification status" on public.host_verification for update
    using (
        exists (
            select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );

-- ==============================================================================
-- 24. REALTIME PUBLICATION CONFIGURATION
-- Strictly exposes safe marketplace updates (no credentials or private docs)
-- ==============================================================================
do $$ begin
    alter publication supabase_realtime add table public.spaces;
exception when others then null;
end $$;

do $$ begin
    alter publication supabase_realtime add table public.availability;
exception when others then null;
end $$;

do $$ begin
    alter publication supabase_realtime add table public.bookings;
exception when others then null;
end $$;

do $$ begin
    alter publication supabase_realtime add table public.payments;
exception when others then null;
end $$;

do $$ begin
    alter publication supabase_realtime add table public.reviews;
exception when others then null;
end $$;

do $$ begin
    alter publication supabase_realtime add table public.notifications;
exception when others then null;
end $$;

-- ==============================================================================
-- 25. STORAGE BUCKETS & HARDENED STORAGE POLICIES
-- ==============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
    ('space-images', 'space-images', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
    ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
    ('ofis-media', 'ofis-media', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
    ('host-verification-docs', 'host-verification-docs', false, 15728640, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS Policies
drop policy if exists "Public media files are accessible" on storage.objects;
create policy "Public media files are accessible" on storage.objects for select
    using (bucket_id in ('space-images', 'avatars', 'ofis-media'));

drop policy if exists "Authenticated users can upload public media to their folders" on storage.objects;
create policy "Authenticated users can upload public media to their folders" on storage.objects for insert
    with check (
        auth.role() = 'authenticated' and bucket_id in ('space-images', 'avatars', 'ofis-media')
    );

drop policy if exists "Private host verification docs restricted to owner and admin" on storage.objects;
create policy "Private host verification docs restricted to owner and admin" on storage.objects for select
    using (
        bucket_id = 'host-verification-docs' 
        and (
            (storage.foldername(name))[1] = auth.uid()::text
            or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
        )
    );

drop policy if exists "Hosts can upload verification documents to own directory" on storage.objects;
create policy "Hosts can upload verification documents to own directory" on storage.objects for insert
    with check (
        auth.role() = 'authenticated' 
        and bucket_id = 'host-verification-docs'
        and (storage.foldername(name))[1] = auth.uid()::text
    );
