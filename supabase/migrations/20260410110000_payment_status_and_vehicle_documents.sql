-- ============================================================================
-- Payment Status on Cost Entries + Vehicle Documents Table
-- ============================================================================

-- 1. Add payment_status to cost_entries ------------------------------------
ALTER TABLE public.cost_entries
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'open';

ALTER TABLE public.cost_entries
  ADD CONSTRAINT cost_entries_payment_status_check
  CHECK (payment_status IN ('open', 'paid'));

CREATE INDEX IF NOT EXISTS idx_cost_entries_payment_status
  ON public.cost_entries(payment_status);


-- 2. Vehicle Documents table ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0),
  document_type text NOT NULL DEFAULT 'registration'
    CHECK (document_type IN ('registration', 'insurance', 'inspection', 'other')),
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vehicle_documents_vehicle
  ON public.vehicle_documents(vehicle_id);

CREATE POLICY "Users can CRUD own vehicle documents"
  ON public.vehicle_documents FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);


-- 3. Storage bucket for vehicle documents -----------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-documents', 'vehicle-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own vehicle documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vehicle-documents'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own vehicle documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'vehicle-documents'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own vehicle documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'vehicle-documents'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );
