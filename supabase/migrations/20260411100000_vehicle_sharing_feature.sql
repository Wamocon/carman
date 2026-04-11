-- ---------------------------------------------------------------------------
-- Migration: Vehicle Sharing / Publication Feature
-- ---------------------------------------------------------------------------

-- 1. Add sharing_enabled to profiles (global toggle for viewing shared vehicles)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS sharing_enabled boolean NOT NULL DEFAULT false;

-- 2. Add publication columns to vehicles
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_header boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS share_details boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS share_images boolean NOT NULL DEFAULT true;

-- 3. Add is_public and description to vehicle_images
ALTER TABLE vehicle_images
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS description text;

-- 4. Public comments on vehicles (by any authenticated user)
CREATE TABLE IF NOT EXISTS public_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public_comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read public comments on published vehicles
CREATE POLICY "public_comments_select" ON public_comments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = public_comments.vehicle_id
        AND v.is_published = true
    )
  );

-- Authenticated users with sharing_enabled can insert comments on published vehicles
CREATE POLICY "public_comments_insert" ON public_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.sharing_enabled = true
    )
    AND EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_id
        AND v.is_published = true
    )
  );

-- Only the vehicle owner can delete public comments on their vehicle
CREATE POLICY "public_comments_delete_owner" ON public_comments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = public_comments.vehicle_id
        AND v.user_id = auth.uid()
    )
  );

-- Comment authors can also delete their own comments
CREATE POLICY "public_comments_delete_author" ON public_comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. Heat-smiley reactions on public comments
CREATE TABLE IF NOT EXISTS public_comment_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  heat_level integer NOT NULL CHECK (heat_level >= 1 AND heat_level <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

ALTER TABLE public_comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comment_reactions_select" ON public_comment_reactions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "comment_reactions_insert" ON public_comment_reactions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.sharing_enabled = true
    )
  );

CREATE POLICY "comment_reactions_update" ON public_comment_reactions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comment_reactions_delete" ON public_comment_reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 6. Heat-smiley reactions on vehicle images
CREATE TABLE IF NOT EXISTS image_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid NOT NULL REFERENCES vehicle_images(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  heat_level integer NOT NULL CHECK (heat_level >= 1 AND heat_level <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (image_id, user_id)
);

ALTER TABLE image_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "image_reactions_select" ON image_reactions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "image_reactions_insert" ON image_reactions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.sharing_enabled = true
    )
  );

CREATE POLICY "image_reactions_update" ON image_reactions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "image_reactions_delete" ON image_reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 7. RLS policy: allow authenticated users with sharing_enabled to view published vehicles
CREATE POLICY "vehicles_select_published" ON vehicles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      is_published = true
      AND EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.sharing_enabled = true
      )
    )
  );

-- 8. RLS policy: allow authenticated users to view public images of published vehicles
CREATE POLICY "vehicle_images_select_public" ON vehicle_images
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      is_public = true
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = vehicle_images.vehicle_id
          AND v.is_published = true
          AND v.share_images = true
      )
      AND EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.sharing_enabled = true
      )
    )
  );

-- 9. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_published ON vehicles (is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_vehicle_images_public ON vehicle_images (is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_public_comments_vehicle ON public_comments (vehicle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_comment_reactions_comment ON public_comment_reactions (comment_id);
CREATE INDEX IF NOT EXISTS idx_image_reactions_image ON image_reactions (image_id);
CREATE INDEX IF NOT EXISTS idx_profiles_sharing ON profiles (sharing_enabled) WHERE sharing_enabled = true;
