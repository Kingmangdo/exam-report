-- ============================================
-- [독강영어학원 ERP] 학습 경고(Academic Warnings) 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS public.academic_warnings (
  id bigserial primary key,
  
  -- 경고 대상 (학생 개별 경고인 경우 학생 ID, 반 전체 경고인 경우 NULL)
  student_id bigint references public.students(id) on delete cascade,
  
  -- 발생한 반 이름
  class_name text not null,
  
  -- 경고가 발생한 기준 시험 일자
  exam_date text not null,
  
  -- 경고 유형 ('WORD_3_FAIL': 단어 3연속, 'RT_3_FAIL': RT 3연속, 'CLASS_FAIL_50': 반 50% 이상 Fail)
  warning_type text not null,
  
  -- 문제가 된 구체적 시험 이름 (예: 'RT 1', '단어 2')
  test_name text,
  
  -- 경고 상세 메시지 (예: "단어 1 - 3회 연속 재시험 (60%, 70%, 55%)")
  message text not null,
  
  -- 원장님 확인 여부 (대시보드에서 '확인' 버튼을 누르면 true로 변경됨)
  is_acknowledged boolean default false,
  
  created_at timestamptz not null default now()
);

-- 인덱스 생성 (조회 속도 최적화)
CREATE INDEX IF NOT EXISTS idx_academic_warnings_student_id ON public.academic_warnings(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_warnings_class_name ON public.academic_warnings(class_name);
CREATE INDEX IF NOT EXISTS idx_academic_warnings_date ON public.academic_warnings(exam_date);
CREATE INDEX IF NOT EXISTS idx_academic_warnings_acknowledged ON public.academic_warnings(is_acknowledged);

-- RLS (Row Level Security) 설정
ALTER TABLE public.academic_warnings ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 읽고 쓸 수 있도록 허용 (강사가 성적 저장 시 백엔드에서 기록하므로)
CREATE POLICY "Allow authenticated full access on academic_warnings" 
  ON public.academic_warnings 
  FOR ALL 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
