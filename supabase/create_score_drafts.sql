-- 임시저장 데이터를 저장하기 위한 테이블
CREATE TABLE IF NOT EXISTS public.score_drafts (
  id bigserial primary key,
  class_name text not null,
  exam_date text not null,
  draft_data jsonb not null,
  last_modified_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_name, exam_date)
);

-- RLS 정책 설정 (필요시)
ALTER TABLE public.score_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "score_drafts_full_access" ON public.score_drafts
  FOR ALL USING (true) WITH CHECK (true);

-- updated_at 트리거 추가
DROP TRIGGER IF EXISTS trg_score_drafts_updated_at ON public.score_drafts;
CREATE TRIGGER trg_score_drafts_updated_at 
  BEFORE UPDATE ON public.score_drafts 
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();
