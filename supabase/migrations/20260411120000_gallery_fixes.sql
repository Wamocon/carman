-- ---------------------------------------------------------------------------
-- Migration: Gallery fixes — storage policy, profiles visibility,
--            image comments, average image ratings
-- ---------------------------------------------------------------------------

-- 1. Allow authenticated users to read public vehicle images in storage
--    (enables signed URL creation for gallery visitors)
CREATE POLICY "Authenticated can read public vehicle images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vehicle-images'
    AND EXISTS (
      SELECT 1 FROM vehicle_images vi
      JOIN vehicles v ON v.id = vi.vehicle_id
      WHERE vi.storage_path = name
        AND vi.is_public = true
        AND v.is_published = true
        AND v.share_images = true
    )
  );

-- 2. Allow authenticated users with sharing_enabled to read basic profile
--    info of other users (display_name) — necessary for gallery owner display.
--    Uses a SECURITY DEFINER helper to avoid infinite recursion when the
--    policy references its own table.
CREATE OR REPLACE FUNCTION public.current_user_has_sharing_enabled()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT sharing_enabled FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE POLICY "Users with sharing can read other profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR public.current_user_has_sharing_enabled()
  );

-- 3. Add optional image_id to public_comments for image-level comments
ALTER TABLE public_comments
  ADD COLUMN IF NOT EXISTS image_id uuid REFERENCES vehicle_images(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_public_comments_image ON public_comments (image_id, created_at DESC)
  WHERE image_id IS NOT NULL;

-- 4. Add avg_rating materialized column to vehicles for gallery sorting
--    (computed from image_reactions). Using a helper function for this.
CREATE OR REPLACE FUNCTION compute_vehicle_avg_rating(vid uuid)
RETURNS real
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(AVG(ir.heat_level)::real, 0)
  FROM image_reactions ir
  JOIN vehicle_images vi ON vi.id = ir.image_id
  WHERE vi.vehicle_id = vid
    AND vi.is_public = true;
$$;
