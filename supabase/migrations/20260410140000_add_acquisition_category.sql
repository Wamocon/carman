-- Add "acquisition" as a valid cost category (Anschaffungskosten)
ALTER TABLE public.cost_entries DROP CONSTRAINT IF EXISTS cost_entries_category_check;
ALTER TABLE public.cost_entries
  ADD CONSTRAINT cost_entries_category_check
  CHECK (category IN (
    'fuel', 'maintenance', 'repair', 'insurance', 'tax',
    'leasing', 'financing', 'parking', 'other', 'acquisition'
  ));
