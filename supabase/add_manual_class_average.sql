-- Add manual_class_average column to bimonthly_scores
ALTER TABLE public.bimonthly_scores ADD COLUMN IF NOT EXISTS manual_class_average NUMERIC;
