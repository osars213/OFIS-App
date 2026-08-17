-- ==============================================================================
-- OFIS: Complete Production Supabase PostgreSQL Database Schema
-- Version: 3.0.0
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

-- 3. PROFILES TABLE (Linked to Supabase auth.users)
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
    is_superhost boolean default false,
    verification_status verification_status_type not null default 'unverified',
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 4. SPACE CATEGORIES TAXONOMY
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

-- 5. SPACE AMENITIES TAXONOMY
create table if not exists public.space_amenities (
    id uuid primary key default gen_random_uuid(),
    code text unique not null,
    name text not null,
    category text not null default 'general', -- 'power', 'connectivity', 'comfort', 'production', 'hospitality'
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

-- 6. SPACES TABLE (Core Marketplace Listings)
create table if not exists public.spaces (
    id uuid primary key default gen_random_uuid(),
    host_id uuid not null references public.profiles(id) on delete cascade,
    owner_id uuid references public.profiles(id) on delete cascade, -- synonym for host_id
    listing_id text unique,
    name text not null,
    tagline text default '',
    description text default '',
    
    space_type text not null default 'coworking_space',
    primary_category text not null default 'WORK',
    subcategory text not null default 'coworking_desks',
    
    -- Location & Geography (Nigerian Cities Supported)
    -- Lagos, Abuja, Port Harcourt, Benin, Ibadan, Enugu, Onitsha, Owerri, Aba, Uyo, Calabar, Asaba, Awka, etc.
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
    
    -- Amenities & Facilities
    amenities jsonb not null default '["24/7 Redundant Power", "Starlink 250Mbps WiFi", "Dual Inverter AC", "Tea & Espresso Bar"]'::jsonb,
    equipment jsonb default '["4K USB-C Displays", "Acoustic Soundproofing"]'::jsonb,
    rules text[] default array['Valid ID required at reception', 'Keep calls inside phone booths', 'No smoking within indoor areas'],
    images text[] not null default array['https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80'],
    opening_hours text default '08:00 AM - 08:00 PM (Mon - Sat)',
    cancellation_policy text default 'Flexible: Free cancellation up to 2 hours before booking start time',
    
    -- Credentials & Secure Access
    wifi_ssid text default 'OFIS_Guest_HighSpeed',
    wifi_pass text default 'WorkFocus2026',
    door_pin text default '4829',
    
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

-- Keep owner_id in sync with host_id
create or replace function public.sync_space_host_owner()
returns trigger as $$
begin
    if new.host_id is not null and new.owner_id is null then
        new.owner_id := new.host_id;
    elsif new.owner_id is not null and new.host_id is null then
        new.host_id := new.owner_id;
    end if;
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_space_host_owner on public.spaces;
create trigger trg_sync_space_host_owner
    before insert or update on public.spaces
    for each row execute function public.sync_space_host_owner();

-- 7. SPACE IMAGES TABLE
create table if not exists public.space_images (
    id uuid primary key default gen_random_uuid(),
    space_id uuid not null references public.spaces(id) on delete cascade,
    image_url text not null,
    caption text default '',
    display_order integer not null default 0,
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- 8. AVAILABILITY TABLE
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

-- 9. DESKS / WORKSTATIONS TABLE
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
    unique(space_id, code)
);

-- 10. BOOKINGS TABLE (Authoritative Booking Truth)
create table if not exists public.bookings (
    id uuid primary key default gen_random_uuid(),
    booking_reference text unique not null,
    space_id uuid not null references public.spaces(id) on delete restrict,
    client_id uuid not null references public.profiles(id) on delete restrict,
    user_id uuid references public.profiles(id) on delete restrict, -- synonym for client_id
    host_id uuid not null references public.profiles(id) on delete restrict,
    desk_id uuid references public.desks(id) on delete set null,
    
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
    
    -- Status & Financials (NGN)
    booking_status booking_status_type not null default 'confirmed',
    status text not null default 'confirmed',
    payment_status text not null default 'successful',
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
    
    -- Access Info & Notes
    wifi_ssid text default 'OFIS_Guest_HighSpeed',
    wifi_pass text default 'WorkFocus2026',
    door_pin text default '4829',
    qr_code_url text not null default '',
    notes text default '',
    
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    
    constraint valid_booking_interval check (end_datetime > start_datetime)
);

-- Keep user_id in sync with client_id and start_time/end_time in sync with start_datetime/end_datetime
create or replace function public.sync_booking_fields()
returns trigger as $$
begin
    if new.client_id is not null and new.user_id is null then
        new.user_id := new.client_id;
    elsif new.user_id is not null and new.client_id is null then
        new.client_id := new.user_id;
    end if;
    
    if new.start_datetime is not null and new.start_time is null then
        new.start_time := new.start_datetime;
    end if;
    if new.end_datetime is not null and new.end_time is null then
        new.end_time := new.end_datetime;
    end if;
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_booking_fields on public.bookings;
create trigger trg_sync_booking_fields
    before insert or update on public.bookings
    for each row execute function public.sync_booking_fields();

-- 11. BOOKING ITEMS / SLOTS TABLE
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

-- 12. PAYMENTS TABLE (Provider-Agnostic: Paystack, Flutterwave, Bank Transfer)
-- NO card PANs or CVVs stored
create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references public.bookings(id) on delete restrict,
    user_id uuid not null references public.profiles(id) on delete restrict,
    transaction_reference text unique not null,
    external_reference text,
    amount numeric not null check (amount >= 0),
    currency text not null default 'NGN',
    provider text not null default 'paystack', -- 'paystack', 'flutterwave', 'bank_transfer', 'opay_kuda'
    channel text default 'card', -- 'card', 'bank', 'ussd', 'qr', 'transfer'
    payment_status payment_status_type not null default 'successful',
    paid_at timestamptz not null default timezone('utc'::text, now()),
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 13. FAVOURITES TABLE
create table if not exists public.favourites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    space_id uuid not null references public.spaces(id) on delete cascade,
    created_at timestamptz not null default timezone('utc'::text, now()),
    constraint unique_user_space_favourite unique (user_id, space_id)
);

-- Create favorites compatibility view
create or replace view public.favorites as 
select id, user_id, space_id, created_at from public.favourites;

-- 14. REVIEWS TABLE
create table if not exists public.reviews (
    id uuid primary key default gen_random_uuid(),
    space_id uuid not null references public.spaces(id) on delete cascade,
    client_id uuid not null references public.profiles(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade, -- synonym for client_id
    booking_id uuid references public.bookings(id) on delete set null,
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
    is_verified_stay boolean default true,
    helpful_count integer default 0 check (helpful_count >= 0),
    helpful_user_ids uuid[] default array[]::uuid[],
    host_reply jsonb default null,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Keep user_id in sync with client_id on reviews
create or replace function public.sync_review_client_user()
returns trigger as $$
begin
    if new.client_id is not null and new.user_id is null then
        new.user_id := new.client_id;
    elsif new.user_id is not null and new.client_id is null then
        new.client_id := new.user_id;
    end if;
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_review_client_user on public.reviews;
create trigger trg_sync_review_client_user
    before insert or update on public.reviews
    for each row execute function public.sync_review_client_user();

-- 15. NOTIFICATIONS TABLE
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    type text not null default 'booking', -- 'booking', 'review', 'system', 'verification', 'payout'
    title text not null,
    message text not null,
    read boolean not null default false,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- 16. HOST & SPACE VERIFICATION RECORDS TABLE
create table if not exists public.host_verification (
    id uuid primary key default gen_random_uuid(),
    host_id uuid not null references public.profiles(id) on delete cascade,
    space_id uuid references public.spaces(id) on delete set null,
    verification_status verification_status_type not null default 'pending',
    verification_type text not null default 'cac_business', -- 'cac_business', 'national_id', 'passport', 'utility_bill'
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

-- Compatibility alias views
create or replace view public.host_verifications as 
select * from public.host_verification;

create or replace view public.verification_records as 
select * from public.host_verification;

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================

-- Spaces Indexes (Optimized for Location, Category, Price, and Status Search)
create index if not exists idx_spaces_host_id on public.spaces(host_id);
create index if not exists idx_spaces_city_state on public.spaces(city, state);
create index if not exists idx_spaces_location_lower on public.spaces(lower(city), lower(state));
create index if not exists idx_spaces_category on public.spaces(primary_category, subcategory);
create index if not exists idx_spaces_space_type on public.spaces(space_type);
create index if not exists idx_spaces_verified_status on public.spaces(verified, status);
create index if not exists idx_spaces_pricing_ngn on public.spaces(hourly_price, daily_price);
create index if not exists idx_spaces_rating on public.spaces(rating desc);

-- Space Images Indexes
create index if not exists idx_space_images_space_id on public.space_images(space_id, display_order);

-- Availability Indexes
create index if not exists idx_availability_space_date on public.availability(space_id, date, available);

-- Desks Indexes
create index if not exists idx_desks_space_id on public.desks(space_id, status);

-- Bookings Indexes (Optimized for client, host, reference, and date-range conflicts)
create index if not exists idx_bookings_client_id on public.bookings(client_id);
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_host_id on public.bookings(host_id);
create index if not exists idx_bookings_space_id on public.bookings(space_id);
create index if not exists idx_bookings_reference on public.bookings(booking_reference);
create index if not exists idx_bookings_schedule on public.bookings(space_id, start_datetime, end_datetime)
where booking_status in ('confirmed', 'checked_in', 'pending', 'payment_pending');

-- Payments Indexes
create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_reference on public.payments(transaction_reference);

-- Favourites Indexes
create index if not exists idx_favourites_user_id on public.favourites(user_id);
create index if not exists idx_favourites_space_id on public.favourites(space_id);

-- Reviews Indexes
create index if not exists idx_reviews_space_id on public.reviews(space_id);
create index if not exists idx_reviews_client_id on public.reviews(client_id);
create index if not exists idx_reviews_booking_id on public.reviews(booking_id);

-- Notifications Indexes
create index if not exists idx_notifications_user_unread on public.notifications(user_id, read, created_at desc);

-- Host Verification Indexes
create index if not exists idx_host_verification_status on public.host_verification(host_id, verification_status);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER (ON AUTH SIGN UP)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, role, avatar_url, phone, verification_status)
    values (
        new.id,
        coalesce(new.email, ''),
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        coalesce((new.raw_user_meta_data->>'role')::user_role, 'client'::user_role),
        coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
        coalesce(new.raw_user_meta_data->>'phone', ''),
        'unverified'::verification_status_type
    )
    on conflict (id) do update set
        email = excluded.email,
        full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
        updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ==============================================================================
-- DOUBLE-BOOKING OVERLAP PREVENTION FUNCTION
-- ==============================================================================
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
          and desk_id = p_desk_id
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
$$ language plpgsql security definer;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - ENABLED ON EVERY TABLE
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.space_categories enable row level security;
alter table public.space_amenities enable row level security;
alter table public.spaces enable row level security;
alter table public.space_images enable row level security;
alter table public.availability enable row level security;
alter table public.desks enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_slots enable row level security;
alter table public.payments enable row level security;
alter table public.favourites enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.host_verification enable row level security;

-- ------------------------------------------------------------------------------
-- TAXONOMY POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Categories viewable by everyone" on public.space_categories;
create policy "Categories viewable by everyone" on public.space_categories for select using (true);

drop policy if exists "Amenities viewable by everyone" on public.space_amenities;
create policy "Amenities viewable by everyone" on public.space_amenities for select using (true);

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
    on public.profiles for select
    using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- SPACES POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Published spaces are viewable by everyone" on public.spaces;
create policy "Published spaces are viewable by everyone"
    on public.spaces for select
    using (
        status != 'archived' or auth.uid() = host_id or auth.uid() = owner_id
    );

drop policy if exists "Hosts can insert spaces" on public.spaces;
create policy "Hosts can insert spaces"
    on public.spaces for insert
    with check (
        auth.uid() = host_id or auth.uid() = owner_id
    );

drop policy if exists "Hosts can update their own spaces" on public.spaces;
create policy "Hosts can update their own spaces"
    on public.spaces for update
    using (
        auth.uid() = host_id or auth.uid() = owner_id
    );

drop policy if exists "Hosts can delete their own spaces" on public.spaces;
create policy "Hosts can delete their own spaces"
    on public.spaces for delete
    using (
        auth.uid() = host_id or auth.uid() = owner_id
    );

-- ------------------------------------------------------------------------------
-- SPACE IMAGES POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Space images are viewable by everyone" on public.space_images;
create policy "Space images are viewable by everyone"
    on public.space_images for select
    using (true);

drop policy if exists "Hosts can manage images for their spaces" on public.space_images;
create policy "Hosts can manage images for their spaces"
    on public.space_images for all
    using (
        exists (
            select 1 from public.spaces
            where spaces.id = space_images.space_id
              and (spaces.host_id = auth.uid() or spaces.owner_id = auth.uid())
        )
    );

-- ------------------------------------------------------------------------------
-- AVAILABILITY POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Availability is viewable by everyone" on public.availability;
create policy "Availability is viewable by everyone"
    on public.availability for select
    using (true);

drop policy if exists "Hosts can manage availability for their spaces" on public.availability;
create policy "Hosts can manage availability for their spaces"
    on public.availability for all
    using (
        exists (
            select 1 from public.spaces
            where spaces.id = availability.space_id
              and (spaces.host_id = auth.uid() or spaces.owner_id = auth.uid())
        )
    );

-- ------------------------------------------------------------------------------
-- DESKS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Desks are viewable by everyone" on public.desks;
create policy "Desks are viewable by everyone"
    on public.desks for select
    using (true);

drop policy if exists "Hosts can manage desks for their spaces" on public.desks;
create policy "Hosts can manage desks for their spaces"
    on public.desks for all
    using (
        exists (
            select 1 from public.spaces
            where spaces.id = desks.space_id
              and (spaces.host_id = auth.uid() or spaces.owner_id = auth.uid())
        )
    );

-- ------------------------------------------------------------------------------
-- BOOKINGS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Users and Hosts can view their bookings" on public.bookings;
create policy "Users and Hosts can view their bookings"
    on public.bookings for select
    using (
        auth.uid() = client_id or auth.uid() = user_id or auth.uid() = host_id
    );

drop policy if exists "Clients can create bookings" on public.bookings;
create policy "Clients can create bookings"
    on public.bookings for insert
    with check (
        auth.uid() = client_id or auth.uid() = user_id
    );

drop policy if exists "Clients and Hosts can update their bookings" on public.bookings;
create policy "Clients and Hosts can update their bookings"
    on public.bookings for update
    using (
        auth.uid() = client_id or auth.uid() = user_id or auth.uid() = host_id
    );

-- ------------------------------------------------------------------------------
-- BOOKING SLOTS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Booking slots are viewable by booking participants" on public.booking_slots;
create policy "Booking slots are viewable by booking participants"
    on public.booking_slots for select
    using (
        exists (
            select 1 from public.bookings
            where bookings.id = booking_slots.booking_id
              and (bookings.client_id = auth.uid() or bookings.user_id = auth.uid() or bookings.host_id = auth.uid())
        )
    );

-- ------------------------------------------------------------------------------
-- PAYMENTS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Users and Hosts can view payments for their bookings" on public.payments;
create policy "Users and Hosts can view payments for their bookings"
    on public.payments for select
    using (
        auth.uid() = user_id or exists (
            select 1 from public.bookings
            where bookings.id = payments.booking_id
              and (bookings.host_id = auth.uid() or bookings.client_id = auth.uid() or bookings.user_id = auth.uid())
        )
    );

drop policy if exists "Authenticated users can create payments" on public.payments;
create policy "Authenticated users can create payments"
    on public.payments for insert
    with check (
        auth.uid() = user_id
    );

-- ------------------------------------------------------------------------------
-- FAVOURITES POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view their own favourites" on public.favourites;
create policy "Users can view their own favourites"
    on public.favourites for select
    using (
        auth.uid() = user_id
    );

drop policy if exists "Users can manage their own favourites" on public.favourites;
create policy "Users can manage their own favourites"
    on public.favourites for all
    using (
        auth.uid() = user_id
    );

-- ------------------------------------------------------------------------------
-- REVIEWS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone"
    on public.reviews for select
    using (true);

drop policy if exists "Clients can create reviews for completed bookings" on public.reviews;
create policy "Clients can create reviews for completed bookings"
    on public.reviews for insert
    with check (
        (auth.uid() = client_id or auth.uid() = user_id)
        and (
            booking_id is null or exists (
                select 1 from public.bookings
                where bookings.id = reviews.booking_id
                  and (bookings.client_id = auth.uid() or bookings.user_id = auth.uid())
            )
        )
    );

drop policy if exists "Review authors can update their reviews" on public.reviews;
create policy "Review authors can update their reviews"
    on public.reviews for update
    using (
        auth.uid() = client_id or auth.uid() = user_id
    );

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
    on public.notifications for select
    using (
        auth.uid() = user_id
    );

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
    on public.notifications for update
    using (
        auth.uid() = user_id
    );

drop policy if exists "Users can delete their own notifications" on public.notifications;
create policy "Users can delete their own notifications"
    on public.notifications for delete
    using (
        auth.uid() = user_id
    );

-- ------------------------------------------------------------------------------
-- HOST VERIFICATION POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Hosts can view their own verification" on public.host_verification;
create policy "Hosts can view their own verification"
    on public.host_verification for select
    using (
        auth.uid() = host_id or exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );

drop policy if exists "Hosts can submit verification" on public.host_verification;
create policy "Hosts can submit verification"
    on public.host_verification for insert
    with check (
        auth.uid() = host_id
    );

drop policy if exists "Admins can update verification status" on public.host_verification;
create policy "Admins can update verification status"
    on public.host_verification for update
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );

-- ==============================================================================
-- REALTIME PUBLICATION CONFIGURATION
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
-- STORAGE BUCKETS CONFIGURATION (SQL DEFINITIONS)
-- ==============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
    ('space-images', 'space-images', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
    ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
    ('ofis-media', 'ofis-media', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
    ('host-verification-docs', 'host-verification-docs', false, 15728640, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS Policies
drop policy if exists "Public space images are accessible" on storage.objects;
create policy "Public space images are accessible"
    on storage.objects for select
    using (bucket_id in ('space-images', 'avatars', 'ofis-media'));

drop policy if exists "Authenticated users can upload space images and avatars" on storage.objects;
create policy "Authenticated users can upload space images and avatars"
    on storage.objects for insert
    with check (
        auth.role() = 'authenticated' and bucket_id in ('space-images', 'avatars', 'ofis-media')
    );

drop policy if exists "Private host verification docs restricted to owner and admin" on storage.objects;
create policy "Private host verification docs restricted to owner and admin"
    on storage.objects for select
    using (
        bucket_id = 'host-verification-docs' 
        and (
            (storage.foldername(name))[1] = auth.uid()::text
            or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
        )
    );

drop policy if exists "Hosts can upload verification documents" on storage.objects;
create policy "Hosts can upload verification documents"
    on storage.objects for insert
    with check (
        auth.role() = 'authenticated' 
        and bucket_id = 'host-verification-docs'
        and (storage.foldername(name))[1] = auth.uid()::text
    );
