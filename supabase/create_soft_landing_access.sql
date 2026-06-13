CREATE TABLE IF NOT EXISTS public.soft_landing_report_access (
  access_token TEXT PRIMARY KEY,
  student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE,
  phase INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  phone_last4 TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.soft_landing_report_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "soft_landing_report_access_full" ON public.soft_landing_report_access FOR ALL USING (true) WITH CHECK (true);
