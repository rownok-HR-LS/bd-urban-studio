-- BD-urban Studio — storage buckets
-- Paths always start with the owner's user id: "<uid>/<file>", so policies can
-- check ownership with storage.foldername(name)[1].

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('balcony-photos', 'balcony-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('renders', 'renders', false, 10485760, array['image/png', 'image/jpeg', 'image/webp']),
  ('job-photos', 'job-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('doctor-photos', 'doctor-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('gallery', 'gallery', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('catalog', 'catalog', true, 4194304, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

-- Customers upload and read their own balcony and plant-doctor photos.
create policy own_uploads_insert on storage.objects for insert to authenticated with check (
  bucket_id in ('balcony-photos', 'doctor-photos')
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy own_files_read on storage.objects for select to authenticated using (
  bucket_id in ('balcony-photos', 'doctor-photos', 'renders', 'job-photos')
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Crew upload job photos and signatures into the customer's folder for their jobs.
create policy crew_job_photos on storage.objects for all to authenticated
  using (
    bucket_id = 'job-photos'
    and exists (
      select 1 from public.jobs j
      where j.crew_id = public.my_crew() and j.user_id::text = (storage.foldername(name))[1]
    )
  )
  with check (
    bucket_id = 'job-photos'
    and exists (
      select 1 from public.jobs j
      where j.crew_id = public.my_crew() and j.user_id::text = (storage.foldername(name))[1]
    )
  );

-- Staff manage every bucket.
create policy staff_storage on storage.objects for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Public buckets are readable by anyone.
create policy public_buckets_read on storage.objects for select to anon, authenticated
  using (bucket_id in ('gallery', 'catalog'));
