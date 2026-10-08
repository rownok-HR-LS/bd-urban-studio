-- BD-urban Studio — row-level security
--
-- Who can see what:
--   anon/guest   catalog, bundles, plans, slots, approved gallery, weather, settings
--   customer     the above + their own designs, orders, garden, subscriptions, chat
--                (guests are Supabase anonymous users, so they are customers too)
--   crew         jobs assigned to their crew and what is needed to do them
--   supplier     their own purchase orders and stock sheet
--   ops/admin    everything
--
-- Prices, totals, AI output and subscription changes are written by edge
-- functions using the service role, so customers never write money fields.

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere and give staff full access
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'app_settings', 'suppliers', 'crews', 'profiles', 'buildings', 'addresses',
    'products', 'product_costs', 'bundles', 'bundle_items', 'stock_movements',
    'supplier_stock', 'purchase_orders', 'po_items',
    'designs', 'design_items', 'design_events',
    'install_slots', 'orders', 'order_items', 'subscription_plans', 'subscriptions', 'payments',
    'jobs', 'visit_reports',
    'garden_plants', 'care_reminders', 'doctor_cases', 'weather_alerts',
    'gallery_posts', 'referrals', 'building_groups', 'building_group_members',
    'support_threads', 'support_messages', 'notifications', 'push_tokens',
    'demand_forecasts'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy staff_all on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff())',
      t
    );
  end loop;
end;
$$;

-- app_settings: everyone reads; only admins write (staff_all is replaced).
drop policy staff_all on public.app_settings;
create policy settings_read on public.app_settings for select to anon, authenticated using (true);
create policy settings_admin_write on public.app_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Public catalog
-- ---------------------------------------------------------------------------
create policy products_public_read on public.products for select to anon, authenticated using (active);
create policy bundles_public_read on public.bundles for select to anon, authenticated using (active);
create policy bundle_items_public_read on public.bundle_items for select to anon, authenticated using (true);
create policy plans_public_read on public.subscription_plans for select to anon, authenticated using (active);
create policy slots_public_read on public.install_slots for select to anon, authenticated
  using (starts_at > now());
create policy weather_public_read on public.weather_alerts for select to anon, authenticated
  using (ends_at > now() - interval '1 day');
create policy gallery_public_read on public.gallery_posts for select to anon, authenticated
  using (approved and customer_consent);

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create policy profiles_self_read on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Crew can see the name/phone of customers they are visiting.
create policy profiles_crew_read on public.profiles for select to authenticated using (
  exists (
    select 1 from public.jobs j
    where j.user_id = profiles.id and j.crew_id = public.my_crew()
  )
);

-- ---------------------------------------------------------------------------
-- Customer-owned rows
-- ---------------------------------------------------------------------------
create policy addresses_own on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy designs_own_read on public.designs for select to authenticated using (user_id = auth.uid());
-- Customers can archive or rename their own designs; AI fields are written by the service role.
create policy designs_own_update on public.designs for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Customers edit the BOM of their own ready designs (swap / remove / add).
create policy design_items_own_read on public.design_items for select to authenticated using (
  exists (select 1 from public.designs d where d.id = design_id and d.user_id = auth.uid())
);
create policy design_items_own_write on public.design_items for all to authenticated
  using (
    exists (select 1 from public.designs d where d.id = design_id and d.user_id = auth.uid() and d.status = 'ready')
  )
  with check (
    exists (select 1 from public.designs d where d.id = design_id and d.user_id = auth.uid() and d.status = 'ready')
  );

create policy design_events_own on public.design_events for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.designs d where d.id = design_id and d.user_id = auth.uid())
  );

create policy orders_own_read on public.orders for select to authenticated using (user_id = auth.uid());
create policy order_items_own_read on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy payments_own_read on public.payments for select to authenticated using (user_id = auth.uid());
create policy subscriptions_own_read on public.subscriptions for select to authenticated using (user_id = auth.uid());

create policy jobs_own_read on public.jobs for select to authenticated using (user_id = auth.uid());
-- Customers can rate a completed job (column guard below keeps everything else fixed).
create policy jobs_own_rate on public.jobs for update to authenticated
  using (user_id = auth.uid() and status = 'completed') with check (user_id = auth.uid());
create policy visit_reports_own_read on public.visit_reports for select to authenticated using (
  exists (select 1 from public.jobs j where j.id = job_id and j.user_id = auth.uid())
);

create policy garden_own on public.garden_plants for select to authenticated using (user_id = auth.uid());
create policy garden_own_update on public.garden_plants for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reminders_own on public.care_reminders for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy doctor_own_read on public.doctor_cases for select to authenticated using (user_id = auth.uid());

create policy gallery_own_read on public.gallery_posts for select to authenticated using (user_id = auth.uid());
create policy referrals_own_read on public.referrals for select to authenticated
  using (referrer_id = auth.uid() or referee_id = auth.uid());

create policy building_groups_member_read on public.building_groups for select to authenticated using (
  organizer_id = auth.uid()
  or exists (select 1 from public.building_group_members m where m.group_id = building_groups.id and m.user_id = auth.uid())
);
create policy building_members_read on public.building_group_members for select to authenticated using (
  user_id = auth.uid()
  or exists (select 1 from public.building_groups g where g.id = group_id and g.organizer_id = auth.uid())
);
create policy buildings_read on public.buildings for select to authenticated using (true);

create policy threads_own on public.support_threads for select to authenticated using (user_id = auth.uid());
create policy threads_own_create on public.support_threads for insert to authenticated
  with check (user_id = auth.uid() and status = 'open' and assigned_to is null);
create policy messages_own_read on public.support_messages for select to authenticated using (
  exists (select 1 from public.support_threads t where t.id = thread_id and t.user_id = auth.uid())
);
create policy messages_own_send on public.support_messages for insert to authenticated with check (
  sender_id = auth.uid()
  and exists (select 1 from public.support_threads t where t.id = thread_id and t.user_id = auth.uid())
);

create policy notifications_own_read on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_own_mark on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy push_tokens_own on public.push_tokens for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Crew
-- ---------------------------------------------------------------------------
create policy crews_crew_read on public.crews for select to authenticated using (id = public.my_crew());
create policy jobs_crew_read on public.jobs for select to authenticated using (crew_id = public.my_crew());
create policy jobs_crew_update on public.jobs for update to authenticated
  using (crew_id = public.my_crew()) with check (crew_id = public.my_crew());
create policy addresses_crew_read on public.addresses for select to authenticated using (
  exists (select 1 from public.jobs j where j.address_id = addresses.id and j.crew_id = public.my_crew())
);
create policy orders_crew_read on public.orders for select to authenticated using (
  exists (select 1 from public.jobs j where j.order_id = orders.id and j.crew_id = public.my_crew())
);
create policy order_items_crew_read on public.order_items for select to authenticated using (
  exists (select 1 from public.jobs j where j.order_id = order_items.order_id and j.crew_id = public.my_crew())
);
create policy garden_crew_read on public.garden_plants for select to authenticated using (
  exists (select 1 from public.jobs j where j.user_id = garden_plants.user_id and j.crew_id = public.my_crew())
);
create policy visit_reports_crew on public.visit_reports for all to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and j.crew_id = public.my_crew()))
  with check (exists (select 1 from public.jobs j where j.id = job_id and j.crew_id = public.my_crew()));

-- ---------------------------------------------------------------------------
-- Supplier portal
-- ---------------------------------------------------------------------------
create policy suppliers_self_read on public.suppliers for select to authenticated using (id = public.my_supplier());
create policy supplier_stock_own on public.supplier_stock for all to authenticated
  using (supplier_id = public.my_supplier()) with check (supplier_id = public.my_supplier());
create policy po_supplier_read on public.purchase_orders for select to authenticated
  using (supplier_id = public.my_supplier() and status <> 'draft');
create policy po_supplier_update on public.purchase_orders for update to authenticated
  using (supplier_id = public.my_supplier() and status in ('sent', 'confirmed'))
  with check (supplier_id = public.my_supplier());
create policy po_items_supplier_read on public.po_items for select to authenticated using (
  exists (select 1 from public.purchase_orders p where p.id = po_id and p.supplier_id = public.my_supplier() and p.status <> 'draft')
);
create policy po_items_supplier_update on public.po_items for update to authenticated
  using (exists (select 1 from public.purchase_orders p where p.id = po_id and p.supplier_id = public.my_supplier() and p.status in ('sent', 'confirmed')))
  with check (exists (select 1 from public.purchase_orders p where p.id = po_id and p.supplier_id = public.my_supplier()));

-- ---------------------------------------------------------------------------
-- Column guards: RLS decides *which rows*; these triggers decide *which fields*
-- non-staff users may change on rows they are allowed to update.
-- ---------------------------------------------------------------------------

-- Design items always carry the live catalog price, whoever writes them.
create function public.price_design_item() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select price into new.unit_price from public.products where id = new.product_id;
  if new.unit_price is null then
    raise exception 'Unknown product %', new.product_id;
  end if;
  if not public.is_staff() and auth.uid() is not null and tg_op = 'INSERT' and new.source = 'ai' then
    new.source := 'customer_add';
  end if;
  return new;
end;
$$;

create trigger design_items_price before insert or update on public.design_items
  for each row execute function public.price_design_item();

create function public.guard_design_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff() or auth.uid() is null then
    return new;
  end if;
  -- Customers may only archive a design or toggle its public share link.
  if new.status not in (old.status, 'archived') then
    raise exception 'Customers can only archive designs';
  end if;
  new := jsonb_populate_record(old, jsonb_build_object('status', new.status, 'share_slug', new.share_slug, 'updated_at', new.updated_at));
  return new;
end;
$$;

create trigger designs_guard before update on public.designs
  for each row execute function public.guard_design_update();

create function public.guard_job_update() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  caller_role public.app_role := public.my_role();
begin
  if public.is_staff() or auth.uid() is null then
    return new;
  end if;
  if caller_role = 'crew' then
    -- Crew updates progress, photos, signature and notes only.
    new := jsonb_populate_record(old, jsonb_build_object(
      'status', new.status, 'checklist', new.checklist,
      'before_photos', new.before_photos, 'after_photos', new.after_photos,
      'signature_path', new.signature_path, 'crew_notes', new.crew_notes,
      'started_at', new.started_at, 'completed_at', new.completed_at, 'updated_at', new.updated_at));
    if new.status not in ('assigned', 'en_route', 'on_site', 'completed') then
      raise exception 'Crew cannot set job status to %', new.status;
    end if;
  else
    -- Customers can only leave a rating.
    new := jsonb_populate_record(old, jsonb_build_object('customer_rating', new.customer_rating, 'updated_at', new.updated_at));
  end if;
  return new;
end;
$$;

create trigger jobs_guard before update on public.jobs
  for each row execute function public.guard_job_update();

create function public.guard_garden_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff() or auth.uid() is null then
    return new;
  end if;
  new := jsonb_populate_record(old, jsonb_build_object('nickname', new.nickname));
  return new;
end;
$$;

create trigger garden_guard before update on public.garden_plants
  for each row execute function public.guard_garden_update();

create function public.guard_po_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff() or auth.uid() is null then
    return new;
  end if;
  -- Suppliers can confirm a sent PO and add notes; nothing else.
  if new.status not in (old.status, 'confirmed') then
    raise exception 'Suppliers can only confirm purchase orders';
  end if;
  new := jsonb_populate_record(old, jsonb_build_object('status', new.status, 'notes', new.notes, 'updated_at', new.updated_at));
  return new;
end;
$$;

create trigger po_guard before update on public.purchase_orders
  for each row execute function public.guard_po_update();

create function public.guard_po_item_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff() or auth.uid() is null then
    return new;
  end if;
  new := jsonb_populate_record(old, jsonb_build_object('confirmed_qty', new.confirmed_qty));
  return new;
end;
$$;

create trigger po_items_guard before update on public.po_items
  for each row execute function public.guard_po_item_update();

create function public.guard_notification_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff() or auth.uid() is null then
    return new;
  end if;
  new := jsonb_populate_record(old, jsonb_build_object('read_at', new.read_at));
  return new;
end;
$$;

create trigger notifications_guard before update on public.notifications
  for each row execute function public.guard_notification_update();

-- ---------------------------------------------------------------------------
-- RPCs that need to cross ownership boundaries safely
-- ---------------------------------------------------------------------------

-- Apply a friend's referral code once, before the first order.
create function public.apply_referral_code(code text) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  referrer uuid;
begin
  select id into referrer from public.profiles where referral_code = upper(trim(code));
  if referrer is null or referrer = auth.uid() then
    return false;
  end if;
  if exists (select 1 from public.referrals where referee_id = auth.uid())
     or exists (select 1 from public.orders where user_id = auth.uid()) then
    return false;
  end if;
  insert into public.referrals (referrer_id, referee_id) values (referrer, auth.uid());
  update public.profiles set referred_by = referrer where id = auth.uid();
  return true;
end;
$$;

-- Join a building group with the code a neighbour shared.
create function public.join_building_group(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  gid uuid;
begin
  select id into gid from public.building_groups
  where building_groups.code = upper(trim(join_building_group.code)) and status = 'open';
  if gid is null then
    return null;
  end if;
  insert into public.building_group_members (group_id, user_id) values (gid, auth.uid())
  on conflict do nothing;
  return gid;
end;
$$;

revoke execute on function public.apply_referral_code(text) from public, anon;
grant execute on function public.apply_referral_code(text) to authenticated;
revoke execute on function public.join_building_group(text) from public, anon;
grant execute on function public.join_building_group(text) to authenticated;
