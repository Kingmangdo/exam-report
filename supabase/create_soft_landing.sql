-- 신입생 소프트랜딩 설정을 저장하는 테이블 (학생 1명당 1개)
CREATE TABLE IF NOT EXISTS public.soft_landing_settings (
  student_id BIGINT PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  excluded BOOLEAN DEFAULT false,
  excluded_reason TEXT,
  excluded_at TIMESTAMPTZ,
  initial_level TEXT, -- 입학 당시 영어 레벨
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 신입생 소프트랜딩 체크포인트 (상담 단계별 기록)
CREATE TABLE IF NOT EXISTS public.soft_landing_checkpoints (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE,
  phase INTEGER NOT NULL CHECK (phase IN (1, 2, 3)), -- 1: 2주차, 2: 6주차, 3: 10주차
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  scheduled_date DATE,
  completed_date TIMESTAMPTZ,
  consult_method TEXT, -- 전화상담, 대면상담, 문자발송, 카카오메시지 등
  
  -- 평가 항목 (JSONB 형태로 유연하게 저장)
  ratings JSONB DEFAULT '{}'::jsonb,
  
  -- 성적 트래킹
  english_score NUMERIC,
  
  -- 메모
  teacher_memo TEXT DEFAULT '',
  focus_memo TEXT DEFAULT '',
  parent_memo TEXT DEFAULT '',
  
  parent_report_sent BOOLEAN DEFAULT false,
  high_school_readiness BOOLEAN DEFAULT false, -- 고등 연계 추천 여부
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- 한 학생은 각 phase에 대해 하나의 체크포인트만 가짐
  UNIQUE(student_id, phase)
);

-- RLS 정책 설정
ALTER TABLE public.soft_landing_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "soft_landing_settings_full_access" ON public.soft_landing_settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.soft_landing_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "soft_landing_checkpoints_full_access" ON public.soft_landing_checkpoints FOR ALL USING (true) WITH CHECK (true);

-- updated_at 트리거
DROP TRIGGER IF EXISTS trg_soft_landing_settings_updated_at ON public.soft_landing_settings;
CREATE TRIGGER trg_soft_landing_settings_updated_at 
  BEFORE UPDATE ON public.soft_landing_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_soft_landing_checkpoints_updated_at ON public.soft_landing_checkpoints;
CREATE TRIGGER trg_soft_landing_checkpoints_updated_at 
  BEFORE UPDATE ON public.soft_landing_checkpoints 
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();
