-- ---------------------------------------------------------------------------
-- Migration: Add focal point columns to vehicle_images for crop/alignment
-- ---------------------------------------------------------------------------

ALTER TABLE vehicle_images
  ADD COLUMN IF NOT EXISTS focal_point_x real NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS focal_point_y real NOT NULL DEFAULT 0.5;

COMMENT ON COLUMN vehicle_images.focal_point_x IS 'Horizontal focal center 0.0 (left) to 1.0 (right), default 0.5';
COMMENT ON COLUMN vehicle_images.focal_point_y IS 'Vertical focal center 0.0 (top) to 1.0 (bottom), default 0.5';
