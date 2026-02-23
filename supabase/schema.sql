-- ============================================
-- [독강영어학원 ERP] 최종 통합 데이터베이스 스키마
-- 날짜: 2026-02-23
-- ⚠️ 이 SQL 하나만 New Query에서 실행하세요!
-- ============================================

-- ============================================
-- [PART 1] 기본 테이블 (이미 존재하면 무시)
-- ============================================

-- 1. 학생 테이블
CREATE TABLE IF NOT EXISTS public.students (
  id bigserial primary key,
  name text not null,
  grade text,
  class_name text,
  phone text,
  parent_name text,
  parent_phone text,
  student_no text,
  school text,
  teacher_name text,
  monthly_tuition integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. 사용자(관리자/강사) 테이블
CREATE TABLE IF NOT EXISTS public.users (
  id bigserial primary key,
  username text not null unique,
  password text not null,
  name text not null,
  role text not null check (role in ('admin', 'instructor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. 반(클래스) 테이블
CREATE TABLE IF NOT EXISTS public.classes (
  id bigserial primary key,
  name text not null unique,
  description text,
  teacher_name text,
  progress text,
  textbook text,
  homework text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3-1. 반 카테고리 컬럼 (이미 있으면 무시)
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'regular';

-- 4. 성적 테이블
CREATE TABLE IF NOT EXISTS public.scores (
  id bigserial primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  exam_date text not null,
  class_name text,
  rt_total integer default 0,
  rt_correct integer default 0,
  rt_score numeric default 0,
  word_total integer default 0,
  word_correct integer default 0,
  word_score numeric default 0,
  rt_details jsonb default '[]'::jsonb,
  word_details jsonb default '[]'::jsonb,
  assignment_score numeric default 0,
  total_score numeric default 0,
  average_score numeric default 0,
  class_average numeric default 0,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, exam_date, class_name)
);

-- 5. 반별 일자별 학습 로그 테이블
CREATE TABLE IF NOT EXISTS public.class_learning_logs (
  id bigserial primary key,
  class_id bigint not null references public.classes(id) on delete cascade,
  log_date text not null,
  progress text,
  textbook text,
  homework text,
  homework_deadline text,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, log_date)
);

-- 6. 바이먼스리 테스트 성적 테이블
CREATE TABLE IF NOT EXISTS public.bimonthly_scores (
  id bigserial primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  exam_date text not null,
  class_name text,
  parts jsonb not null default '[]'::jsonb,
  total_score numeric default 0,
  average_score numeric default 0,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, exam_date, class_name)
);

-- 7. 상담 일지 테이블
CREATE TABLE IF NOT EXISTS public.counseling_logs (
  id bigserial primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  counselor_name text not null,
  category text default '일반상담',
  content text not null,
  consultation_date date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. 카카오 발송 이력 테이블
CREATE TABLE IF NOT EXISTS public.kakao_send_history (
  id bigserial primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  score_id bigint not null references public.scores(id) on delete cascade,
  parent_phone text not null,
  send_status text not null,
  send_at timestamptz not null default now(),
  retry_count integer not null default 0,
  error_message text
);

-- 9. 성적표 접근 토큰 테이블
CREATE TABLE IF NOT EXISTS public.report_access (
  id bigserial primary key,
  score_id bigint not null references public.scores(id) on delete cascade,
  access_token text not null unique,
  student_name text not null,
  phone_last4 text not null,
  expires_at timestamptz not null,
  accessed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 10. 설정 테이블
CREATE TABLE IF NOT EXISTS public.settings (
  id bigserial primary key,
  key text not null unique,
  value text,
  updated_at timestamptz not null default now()
);

-- 11. 바이먼스리 성적표 접근 토큰 테이블
CREATE TABLE IF NOT EXISTS public.bimonthly_report_access (
  id bigserial primary key,
  bimonthly_score_id bigint not null references public.bimonthly_scores(id) on delete cascade,
  access_token text not null unique,
  student_name text not null,
  phone_last4 text not null,
  expires_at timestamptz not null,
  accessed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 12. 바이먼스리 카카오 발송 이력 테이블
CREATE TABLE IF NOT EXISTS public.bimonthly_kakao_send_history (
  id bigserial primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  bimonthly_score_id bigint not null references public.bimonthly_scores(id) on delete cascade,
  parent_phone text not null,
  send_status text not null,
  send_at timestamptz not null default now(),
  retry_count integer not null default 0,
  error_message text
);

-- 13. 예약자 테이블
CREATE TABLE IF NOT EXISTS public.reservations (
  id bigserial primary key,
  name text not null,
  visit_date timestamptz not null,
  school text,
  grade text,
  student_phone text,
  parent_phone text,
  recent_english_score text,
  notes text,
  status text default '예약' check (status in ('예약', '방문완료', '취소', '입학')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 14. 레벨테스트 성적표 테이블
CREATE TABLE IF NOT EXISTS public.level_test_scores (
  id bigserial primary key,
  reservation_id bigint not null references public.reservations(id) on delete cascade,
  test_date text not null,
  parts jsonb not null default '[]'::jsonb,
  total_score numeric default 0,
  average_score numeric default 0,
  overall_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 15. 레벨테스트 성적표 접근 토큰
CREATE TABLE IF NOT EXISTS public.level_test_report_access (
  id bigserial primary key,
  level_test_id bigint not null references public.level_test_scores(id) on delete cascade,
  access_token text not null unique,
  name text not null,
  phone_last4 text not null,
  expires_at timestamptz not null,
  accessed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 16. 예약 안내 알림톡 발송 이력 테이블
CREATE TABLE IF NOT EXISTS public.reservation_kakao_send_history (
  id bigserial primary key,
  reservation_id bigint not null references public.reservations(id) on delete cascade,
  parent_phone text not null,
  send_status text not null,
  send_at timestamptz not null default now(),
  retry_count integer not null default 0,
  error_message text
);

-- ============================================
-- [PART 2] 보강 테이블 (완전 초기화 후 재생성)
-- ============================================

-- 기존 보강 테이블 완전 삭제 (CASCADE = 정책/의존성 모두 제거)
DROP TABLE IF EXISTS public.supplementary_students CASCADE;
DROP TABLE IF EXISTS public.supplementary_sessions CASCADE;

-- 17. 보강 일정 테이블
CREATE TABLE public.supplementary_sessions (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  class_id BIGINT REFERENCES public.classes(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. 보강 참여 학생 테이블
CREATE TABLE public.supplementary_students (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  session_id BIGINT REFERENCES public.supplementary_sessions(id) ON DELETE CASCADE,
  student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE,
  attendance_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- 보강 테이블 RLS + 정책
ALTER TABLE public.supplementary_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplementary_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "supp_sessions_full_access_v2" ON public.supplementary_sessions
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "supp_students_full_access_v2" ON public.supplementary_students
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- [PART 3] 인덱스 & 트리거
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_class_name ON public.students(class_name);
CREATE INDEX IF NOT EXISTS idx_scores_exam_date ON public.scores(exam_date);
CREATE INDEX IF NOT EXISTS idx_scores_class_exam ON public.scores(class_name, exam_date);
CREATE INDEX IF NOT EXISTS idx_learning_logs_date ON public.class_learning_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_counseling_student ON public.counseling_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_bimonthly_exam_date ON public.bimonthly_scores(exam_date);
CREATE INDEX IF NOT EXISTS idx_bimonthly_class ON public.bimonthly_scores(class_name, exam_date);

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('students', 'users', 'classes', 'scores', 'class_learning_logs', 'counseling_logs', 'settings')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t, t);
  END LOOP;
END;
$$;

-- 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';
