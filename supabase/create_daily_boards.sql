CREATE TABLE IF NOT EXISTS public.daily_boards (
  target_date DATE PRIMARY KEY,
  global_memo TEXT DEFAULT '',
  rt_notes JSONB DEFAULT '{}'::jsonb,
  last_modified_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_boards_full_access" ON public.daily_boards
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER trg_daily_boards_updated_at 
  BEFORE UPDATE ON public.daily_boards 
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();
