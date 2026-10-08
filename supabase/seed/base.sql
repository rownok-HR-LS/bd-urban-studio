-- Base seed: settings, subscription tiers, crews and install slots.
-- The catalog (suppliers, products, bundles) is generated from
-- packages/core/src/catalog by `npm run db:seed` into catalog.sql.

insert into public.app_settings (id, data) values (1, '{
  "guarantee_days": 60,
  "human_review_first_n": 100,
  "base_install_fee": 1500,
  "no_lift_fee_per_floor": 150,
  "referral_credit": 500,
  "building_bundle_discount_pct": 10,
  "building_bundle_min_flats": 3,
  "balcony_load_review_kg": 150,
  "cities": ["dhaka", "chittagong"]
}'::jsonb)
on conflict (id) do update set data = excluded.data;

insert into public.subscription_plans
  (id, name_en, name_bn, description_en, description_bn, visits_per_month, price_monthly, includes, free_replacements, sort)
values
  ('essential', 'Essential', 'এসেনশিয়াল',
   'One visit a month: health check, pruning, feeding and pest control.',
   'মাসে একবার ভিজিট: স্বাস্থ্য পরীক্ষা, ছাঁটাই, সার ও পোকা দমন।',
   1, 990, '["health_check","pruning","fertilizer","pest_control"]', false, 1),
  ('lush', 'Lush', 'লাশ',
   'A visit every two weeks, seasonal re-potting and discounted replacements.',
   'প্রতি দুই সপ্তাহে ভিজিট, মৌসুমি টব বদল আর ছাড়ে গাছ বদল।',
   2, 1790, '["health_check","pruning","fertilizer","pest_control","repotting","replacement_discount"]', false, 2),
  ('full_care', 'Full-Care', 'ফুল-কেয়ার',
   'Weekly visits, watering while you travel and free plant replacement.',
   'সাপ্তাহিক ভিজিট, বাইরে থাকলে পানি দেওয়া আর বিনামূল্যে গাছ বদল।',
   4, 3290, '["health_check","pruning","fertilizer","pest_control","repotting","watering","free_replacement","priority_support"]', true, 3)
on conflict (id) do update set
  name_en = excluded.name_en, name_bn = excluded.name_bn,
  description_en = excluded.description_en, description_bn = excluded.description_bn,
  visits_per_month = excluded.visits_per_month, price_monthly = excluded.price_monthly,
  includes = excluded.includes, free_replacements = excluded.free_replacements, sort = excluded.sort;

insert into public.crews (id, name, city, color) values
  ('00000000-0000-4000-a000-000000000001', 'Dhaka Crew A', 'dhaka', '#3F6B4E'),
  ('00000000-0000-4000-a000-000000000002', 'Dhaka Crew B', 'dhaka', '#C9734B'),
  ('00000000-0000-4000-a000-000000000003', 'Chittagong Crew A', 'chittagong', '#5F8FA0')
on conflict (id) do nothing;

-- Install slots for the next 6 weeks: morning and afternoon, Saturday–Thursday
-- (Friday off), in Bangladesh time. Capacity = number of crews in the city.
insert into public.install_slots (city, starts_at, ends_at, capacity)
select c.city, (d + s.start_time) at time zone 'Asia/Dhaka', (d + s.end_time) at time zone 'Asia/Dhaka', c.crews
from generate_series((current_date + 2)::timestamp, (current_date + 42)::timestamp, interval '1 day') as d
cross join (values (time '09:00', time '13:00'), (time '14:00', time '18:00')) as s(start_time, end_time)
cross join (values ('dhaka'::public.city, 2), ('chittagong'::public.city, 1)) as c(city, crews)
where extract(isodow from d) <> 5
  and not exists (select 1 from public.install_slots x where x.city = c.city and x.starts_at = (d + s.start_time) at time zone 'Asia/Dhaka');
