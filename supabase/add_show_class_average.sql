-- Add show_class_average column to bimonthly_scores
ALTER TABLE public.bimonthly_scores ADD COLUMN IF NOT EXISTS show_class_average BOOLEAN DEFAULT true;
