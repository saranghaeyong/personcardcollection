-- ============================================================
-- PERSON CARD COLLECTION — DATABASE SCHEMA & STORAGE SETUP
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- 1. Create the 'people' table
CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  date_of_birth DATE NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast name searches and sorting
CREATE INDEX IF NOT EXISTS idx_people_name ON public.people (name);
CREATE INDEX IF NOT EXISTS idx_people_created_at ON public.people (created_at DESC);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for 'people' table
-- Allow anyone (public & anonymous) to read the collection
DROP POLICY IF EXISTS "Allow public read access" ON public.people;
CREATE POLICY "Allow public read access" ON public.people
  FOR SELECT USING (true);

-- Allow authenticated administrators to insert new people
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.people;
CREATE POLICY "Allow authenticated insert" ON public.people
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated administrators to update people
DROP POLICY IF EXISTS "Allow authenticated update" ON public.people;
CREATE POLICY "Allow authenticated update" ON public.people
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow authenticated administrators to delete people
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.people;
CREATE POLICY "Allow authenticated delete" ON public.people
  FOR DELETE TO authenticated USING (true);

-- 4. Set up the Storage Bucket 'person-photos'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('person-photos', 'person-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS Policies for 'person-photos'
-- Allow public read access to photos
DROP POLICY IF EXISTS "Public read person photos" ON storage.objects;
CREATE POLICY "Public read person photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'person-photos');

-- Allow authenticated users to upload photos
DROP POLICY IF EXISTS "Authenticated upload person photos" ON storage.objects;
CREATE POLICY "Authenticated upload person photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'person-photos');

-- Allow authenticated users to update/replace photos
DROP POLICY IF EXISTS "Authenticated update person photos" ON storage.objects;
CREATE POLICY "Authenticated update person photos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'person-photos');

-- Allow authenticated users to delete photos
DROP POLICY IF EXISTS "Authenticated delete person photos" ON storage.objects;
CREATE POLICY "Authenticated delete person photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'person-photos');
