-- BD-urban Studio — core schema
-- Covers every module in the scope doc: RSS catalog, AI designs, orders &
-- deployment, maintenance subscriptions, crew jobs, supplier portal,
-- after-care (garden, reminders, plant doctor, weather) and growth features.
-- Row-level security policies live in the next migration.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('customer', 'ops', 'admin', 'crew', 'supplier');
create type public.city as enum ('dhaka', 'chittagong');
create type public.product_category as enum ('plant', 'pot', 'hardware', 'accessory');
create type public.care_level as enum ('easy', 'moderate', 'expert');
create type public.supplier_kind as enum ('nursery', 'pots', 'hardware', 'accessories');
create type public.stock_reason as enum ('purchase', 'sale', 'replacement', 'adjustment', 'return', 'damage');
create type public.design_status as enum ('draft', 'generating', 'needs_review', 'ready', 'failed', 'ordered', 'archived');
create type public.design_item_source as enum ('ai', 'customer_add', 'customer_swap', 'reviewer');
create type public.design_event_kind as enum ('swap', 'remove', 'add', 'quantity', 'budget', 'regenerate', 'review_edit');
create type public.order_kind as enum ('items', 'bundle', 'design');
create type public.order_status as enum (
  'pending_payment', 'paid', 'procuring', 'scheduled', 'installing', 'completed', 'cancelled', 'refunded'
);
create type public.payment_provider as enum ('bkash', 'nagad', 'card', 'cod', 'credit');
create type public.payment_status as enum ('initiated', 'succeeded', 'failed', 'refunded');
create type public.job_kind as enum ('install', 'maintenance', 'replacement', 'doctor_visit');
create type public.job_status as enum (
  'unassigned', 'assigned', 'en_route', 'on_site', 'completed', 'missed', 'cancelled'
);
create type public.subscription_status as enum ('active', 'paused', 'past_due', 'cancelled');
create type public.plant_status as enum ('thriving', 'ok', 'stressed', 'dead', 'replaced');
create type public.reminder_kind as enum ('water', 'fertilize', 'prune', 'pest', 'repot', 'move_inside', 'move_outside');
create type public.doctor_action as enum ('self_care', 'crew_visit', 'replacement');
create type public.alert_kind as enum ('heavy_rain', 'heatwave', 'cyclone', 'storm', 'cold_wave', 'air_quality');
create type public.po_status as enum ('draft', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled');
create type public.referral_status as enum ('signed_up', 'installed', 'credited');
create type public.thread_status as enum ('open', 'waiting_customer', 'resolved');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Settings (single row, editable by admin)
-- ---------------------------------------------------------------------------
create table public.app_settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- ---------------------------------------------------------------------------
-- Suppliers, crews and people
-- ---------------------------------------------------------------------------
create table public.suppliers (
  id text primary key,
  name text not null,
  kind public.supplier_kind not null,
  city public.city not null,
  area text not null,
  contact_name text not null,
  phone text not null,
  lead_time_days int not null default 2 check (lead_time_days >= 0),
  reliability_score numeric(5, 2) not null default 80 check (reliability_score between 0 and 100),
  defect_rate numeric(5, 4) not null default 0 check (defect_rate between 0 and 1),
  payment_terms text not null default 'Cash on delivery',
  is_sample boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.crews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city public.city not null,
  color text not null default '#3F6B4E',
  daily_job_capacity int not null default 3 check (daily_job_capacity > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'customer',
  full_name text,
  phone text unique,
  locale text not null default 'bn' check (locale in ('en', 'bn')),
  city public.city,
  referral_code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  referred_by uuid references public.profiles (id) on delete set null,
  credit_balance numeric(12, 2) not null default 0 check (credit_balance >= 0),
  supplier_id text references public.suppliers (id) on delete set null,
  crew_id uuid references public.crews (id) on delete set null,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_users_have_supplier check (role <> 'supplier' or supplier_id is not null),
  constraint crew_users_have_crew check (role <> 'crew' or crew_id is not null)
);

-- Security-definer helpers so RLS policies can ask "who is this?" without
-- recursing into the profiles policies.
create function public.my_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('ops', 'admin') from public.profiles where id = auth.uid()), false)
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

create function public.my_crew() returns uuid
language sql stable security definer set search_path = public as $$
  select crew_id from public.profiles where id = auth.uid() and role = 'crew'
$$;

create function public.my_supplier() returns text
language sql stable security definer set search_path = public as $$
  select supplier_id from public.profiles where id = auth.uid() and role = 'supplier'
$$;

-- Every new auth user (including anonymous guests) gets a customer profile.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone, full_name)
  values (new.id, nullif(new.phone, ''), new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the profile phone in sync when a guest links their phone number.
create function public.handle_user_phone_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set phone = nullif(new.phone, '') where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_phone_changed
  after update of phone on auth.users
  for each row when (old.phone is distinct from new.phone)
  execute function public.handle_user_phone_change();

-- Customers may edit their own profile but never their role, credit or links.
create function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() and auth.uid() is not null then
    new.role := old.role;
    new.credit_balance := old.credit_balance;
    new.supplier_id := old.supplier_id;
    new.crew_id := old.crew_id;
    new.referral_code := old.referral_code;
    if old.referred_by is not null then
      new.referred_by := old.referred_by;
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text not null,
  city public.city not null,
  address text,
  lat double precision,
  lng double precision,
  access_notes text,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'Home',
  line1 text not null,
  area text not null,
  city public.city not null,
  building_id uuid references public.buildings (id) on delete set null,
  floor int check (floor >= 0),
  has_lift boolean not null default true,
  lat double precision,
  lng double precision,
  access_notes text,
  access_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RSS catalog
-- ---------------------------------------------------------------------------
create table public.products (
  id text primary key,
  sku text not null unique,
  category public.product_category not null,
  name_en text not null,
  name_bn text not null,
  description_en text not null default '',
  description_bn text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  stock int not null default 0,
  unit text not null default 'piece',
  weight_kg numeric(8, 2) not null default 0 check (weight_kg >= 0),
  care_level public.care_level not null default 'easy',
  aesthetic_tags text[] not null default '{}',
  supplier_id text not null references public.suppliers (id),
  illustration jsonb not null default '{}'::jsonb,
  image_url text,
  active boolean not null default true,
  plant jsonb,
  pot jsonb,
  hardware jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plant_specs_match check ((category = 'plant') = (plant is not null)),
  constraint pot_specs_match check ((category = 'pot') = (pot is not null)),
  constraint hardware_specs_match check ((category = 'hardware') = (hardware is not null))
);

create index products_category_idx on public.products (category) where active;
create index products_supplier_idx on public.products (supplier_id);
create index products_plant_sun_idx on public.products (((plant ->> 'min_sun_hours')::numeric)) where category = 'plant';

-- Cost of goods is staff-only, so it lives in its own table with its own policy.
create table public.product_costs (
  product_id text primary key references public.products (id) on delete cascade,
  cost numeric(12, 2) not null check (cost >= 0),
  updated_at timestamptz not null default now()
);

create table public.bundles (
  id text primary key,
  slug text not null unique,
  name_en text not null,
  name_bn text not null,
  description_en text not null default '',
  description_bn text not null default '',
  discount_pct numeric(5, 2) not null default 0 check (discount_pct between 0 and 50),
  min_sun_hours numeric(4, 1) not null default 0,
  max_sun_hours numeric(4, 1) not null default 12,
  illustration jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.bundle_items (
  bundle_id text not null references public.bundles (id) on delete cascade,
  product_id text not null references public.products (id),
  quantity int not null default 1 check (quantity > 0),
  primary key (bundle_id, product_id)
);

create table public.stock_movements (
  id bigint generated always as identity primary key,
  product_id text not null references public.products (id),
  delta int not null check (delta <> 0),
  reason public.stock_reason not null,
  reference text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create function public.apply_stock_movement() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.products set stock = stock + new.delta where id = new.product_id;
  return new;
end;
$$;

create trigger stock_movement_applied after insert on public.stock_movements
  for each row execute function public.apply_stock_movement();

-- What each supplier says it can deliver right now (updated from the supplier portal).
create table public.supplier_stock (
  supplier_id text not null references public.suppliers (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  available_qty int not null default 0 check (available_qty >= 0),
  unit_cost numeric(12, 2),
  updated_at timestamptz not null default now(),
  primary key (supplier_id, product_id)
);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  supplier_id text not null references public.suppliers (id),
  status public.po_status not null default 'draft',
  expected_at date,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.po_items (
  id uuid primary key default gen_random_uuid(),
  po_id uuid not null references public.purchase_orders (id) on delete cascade,
  product_id text not null references public.products (id),
  quantity int not null check (quantity > 0),
  unit_cost numeric(12, 2) not null check (unit_cost >= 0),
  confirmed_qty int check (confirmed_qty >= 0),
  received_qty int not null default 0 check (received_qty >= 0)
);

-- ---------------------------------------------------------------------------
-- AI designs
-- ---------------------------------------------------------------------------
create table public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.design_status not null default 'draft',
  city public.city,
  -- sunlight hours, orientation, dimensions, use case, budget band, pets, kids, floor…
  intake jsonb not null default '{}'::jsonb,
  -- compass heading + sun-path calculation from the phone
  sun_analysis jsonb,
  photo_paths text[] not null default '{}',
  render_paths text[] not null default '{}',
  -- what the vision model saw: railing type, surface, visible light, hazards
  scene jsonb,
  ai_model text,
  ai_cost_usd numeric(8, 4),
  estimated_load_kg numeric(8, 2),
  review_required boolean not null default false,
  review_reasons text[] not null default '{}',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  share_slug text unique,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index designs_user_idx on public.designs (user_id, created_at desc);
create index designs_review_idx on public.designs (created_at) where status = 'needs_review';

create table public.design_items (
  id uuid primary key default gen_random_uuid(),
  design_id uuid not null references public.designs (id) on delete cascade,
  product_id text not null references public.products (id),
  quantity int not null default 1 check (quantity > 0),
  placement_note text not null default '',
  sunlight_match numeric(3, 2) check (sunlight_match between 0 and 1),
  watering_schedule text,
  care_level public.care_level,
  swap_suggestions jsonb not null default '[]'::jsonb,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  position int not null default 0,
  source public.design_item_source not null default 'ai',
  created_at timestamptz not null default now()
);

create index design_items_design_idx on public.design_items (design_id, position);

-- Every customer/reviewer edit is a training signal (scope doc §4.4).
create table public.design_events (
  id bigint generated always as identity primary key,
  design_id uuid not null references public.designs (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  kind public.design_event_kind not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders, payments, scheduling
-- ---------------------------------------------------------------------------
create sequence public.order_number_seq start 1001;

create table public.install_slots (
  id uuid primary key default gen_random_uuid(),
  city public.city not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int not null default 1 check (capacity >= 0),
  booked int not null default 0 check (booked >= 0),
  constraint slot_window check (ends_at > starts_at),
  constraint slot_not_overbooked check (booked <= capacity)
);

create index install_slots_city_time_idx on public.install_slots (city, starts_at);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('BDU-' || nextval('public.order_number_seq')::text),
  user_id uuid not null references public.profiles (id),
  design_id uuid references public.designs (id) on delete set null,
  kind public.order_kind not null,
  status public.order_status not null default 'pending_payment',
  address_id uuid references public.addresses (id),
  install_slot_id uuid references public.install_slots (id),
  subtotal numeric(12, 2) not null default 0,
  install_fee numeric(12, 2) not null default 0,
  delivery_fee numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  credit_used numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  building_group_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text references public.products (id),
  bundle_id text references public.bundles (id),
  quantity int not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  unit_cost numeric(12, 2),
  placement_note text,
  constraint item_is_product_or_bundle check ((product_id is null) <> (bundle_id is null))
);

create table public.subscription_plans (
  id text primary key,
  name_en text not null,
  name_bn text not null,
  description_en text not null default '',
  description_bn text not null default '',
  visits_per_month numeric(3, 1) not null check (visits_per_month > 0),
  price_monthly numeric(12, 2) not null check (price_monthly >= 0),
  includes jsonb not null default '[]'::jsonb,
  free_replacements boolean not null default false,
  sort int not null default 0,
  active boolean not null default true
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  address_id uuid not null references public.addresses (id),
  plan_id text not null references public.subscription_plans (id),
  status public.subscription_status not null default 'active',
  price_monthly numeric(12, 2) not null,
  payment_method public.payment_provider not null,
  started_at timestamptz not null default now(),
  paused_until date,
  cancelled_at timestamptz,
  cancel_reason text,
  next_billing_at date not null default (current_date + 30),
  guarantee_until date,
  health_score int check (health_score between 0 and 100),
  churn_risk numeric(3, 2) check (churn_risk between 0 and 1),
  churn_reasons text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_status_idx on public.subscriptions (status);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  order_id uuid references public.orders (id) on delete set null,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  provider public.payment_provider not null,
  amount numeric(12, 2) not null check (amount >= 0),
  status public.payment_status not null default 'initiated',
  provider_ref text,
  sandbox boolean not null default true,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_has_target check (order_id is not null or subscription_id is not null)
);

-- ---------------------------------------------------------------------------
-- Crew jobs and visit reports
-- ---------------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  kind public.job_kind not null,
  status public.job_status not null default 'unassigned',
  order_id uuid references public.orders (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  address_id uuid not null references public.addresses (id),
  crew_id uuid references public.crews (id) on delete set null,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  route_order int,
  checklist jsonb not null default '[]'::jsonb,
  before_photos text[] not null default '{}',
  after_photos text[] not null default '{}',
  signature_path text,
  customer_rating int check (customer_rating between 1 and 5),
  crew_notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_crew_day_idx on public.jobs (crew_id, scheduled_start);
create index jobs_status_idx on public.jobs (status);

create table public.visit_reports (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.jobs (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  -- [{garden_plant_id, status, note}]
  plant_health jsonb not null default '[]'::jsonb,
  actions text[] not null default '{}',
  parts_replaced jsonb not null default '[]'::jsonb,
  health_score int check (health_score between 0 and 100),
  photos text[] not null default '{}',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- After-care: the customer's garden, reminders, plant doctor, weather
-- ---------------------------------------------------------------------------
create table public.garden_plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  address_id uuid references public.addresses (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  product_id text not null references public.products (id),
  nickname text,
  placement_note text,
  status public.plant_status not null default 'thriving',
  planted_at date not null default current_date,
  guarantee_until date,
  replaced_by uuid references public.garden_plants (id) on delete set null,
  created_at timestamptz not null default now()
);

create index garden_plants_user_idx on public.garden_plants (user_id);

create table public.care_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  garden_plant_id uuid references public.garden_plants (id) on delete cascade,
  kind public.reminder_kind not null,
  due_at timestamptz not null,
  recurrence_days int check (recurrence_days > 0),
  done_at timestamptz,
  source text not null default 'schedule',
  created_at timestamptz not null default now()
);

create index care_reminders_due_idx on public.care_reminders (user_id, due_at) where done_at is null;

create table public.doctor_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  garden_plant_id uuid references public.garden_plants (id) on delete set null,
  photo_path text not null,
  question text,
  -- {condition, confidence, causes[], steps[], urgency}
  diagnosis jsonb,
  action public.doctor_action,
  covered_by_guarantee boolean not null default false,
  job_id uuid references public.jobs (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.weather_alerts (
  id uuid primary key default gen_random_uuid(),
  city public.city not null,
  kind public.alert_kind not null,
  severity smallint not null default 1 check (severity between 1 and 3),
  title_en text not null,
  title_bn text not null,
  body_en text not null,
  body_bn text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  source text not null default 'open-meteo',
  created_at timestamptz not null default now(),
  unique (city, kind, starts_at)
);

-- ---------------------------------------------------------------------------
-- Growth: gallery, referrals, building bundles
-- ---------------------------------------------------------------------------
create table public.gallery_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  job_id uuid references public.jobs (id) on delete set null,
  design_id uuid references public.designs (id) on delete set null,
  before_path text not null,
  after_path text not null,
  city public.city not null,
  area text,
  budget_band text,
  sun_band text,
  caption_en text,
  caption_bn text,
  customer_consent boolean not null default false,
  approved boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles (id) on delete cascade,
  referee_id uuid not null unique references public.profiles (id) on delete cascade,
  status public.referral_status not null default 'signed_up',
  credited_at timestamptz,
  created_at timestamptz not null default now(),
  constraint no_self_referral check (referrer_id <> referee_id)
);

create table public.building_groups (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings (id) on delete cascade,
  organizer_id uuid not null references public.profiles (id) on delete cascade,
  code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  status text not null default 'open' check (status in ('open', 'confirmed', 'closed')),
  created_at timestamptz not null default now()
);

create table public.building_group_members (
  group_id uuid not null references public.building_groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.orders
  add constraint orders_building_group_fk foreign key (building_group_id)
  references public.building_groups (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Support chat and notifications
-- ---------------------------------------------------------------------------
create table public.support_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  order_id uuid references public.orders (id) on delete set null,
  status public.thread_status not null default 'open',
  assigned_to uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.support_threads (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  attachments text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.push_tokens (
  token text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('android', 'ios', 'web')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Ops intelligence
-- ---------------------------------------------------------------------------
create table public.demand_forecasts (
  product_id text not null references public.products (id) on delete cascade,
  city public.city not null,
  week_start date not null,
  predicted_qty numeric(10, 2) not null,
  basis jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now(),
  primary key (product_id, city, week_start)
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger touch before update on public.suppliers for each row execute function public.touch_updated_at();
create trigger touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger touch before update on public.products for each row execute function public.touch_updated_at();
create trigger touch before update on public.product_costs for each row execute function public.touch_updated_at();
create trigger touch before update on public.purchase_orders for each row execute function public.touch_updated_at();
create trigger touch before update on public.designs for each row execute function public.touch_updated_at();
create trigger touch before update on public.orders for each row execute function public.touch_updated_at();
create trigger touch before update on public.subscriptions for each row execute function public.touch_updated_at();
create trigger touch before update on public.payments for each row execute function public.touch_updated_at();
create trigger touch before update on public.jobs for each row execute function public.touch_updated_at();
create trigger touch before update on public.support_threads for each row execute function public.touch_updated_at();
create trigger touch before update on public.app_settings for each row execute function public.touch_updated_at();
