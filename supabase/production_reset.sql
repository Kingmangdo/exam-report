-- ============================================
-- [독강영어학원 ERP] 운영 DB 완전 초기화 + 재생성
-- 날짜: 2026-02-23
-- ⚠️ 운영 Supabase SQL Editor → New Query에서 실행
-- ============================================

-- ============================================
-- [STEP 1] 기존 테이블 전부 삭제 (의존성 순서대로)
-- ============================================
DROP TABLE IF EXISTS public.supplementary_students CASCADE;
DROP TABLE IF EXISTS public.supplementary_sessions CASCADE;
DROP TABLE IF EXISTS public.reservation_kakao_send_history CASCADE;
DROP TABLE IF EXISTS public.level_test_report_access CASCADE;
DROP TABLE IF EXISTS public.level_test_scores CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.bimonthly_kakao_send_history CASCADE;
DROP TABLE IF EXISTS public.bimonthly_report_access CASCADE;
DROP TABLE IF EXISTS public.bimonthly_scores CASCADE;
DROP TABLE IF EXISTS public.kakao_send_history CASCADE;
DROP TABLE IF EXISTS public.report_access CASCADE;
DROP TABLE IF EXISTS public.scores CASCADE;
DROP TABLE IF EXISTS public.counseling_logs CASCADE;
DROP TABLE IF EXISTS public.class_learning_logs CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;

-- ============================================
-- [STEP 2] 테이블 생성
-- ============================================

-- 1. 학생 테이블
CREATE TABLE public.students (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  grade text,
  class_name text,
  phone text,
  parent_name text,
  parent_phone text,
  student_no text,
  school text,
  teacher_name text,
  monthly_tuition integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. 사용자(관리자/강사) 테이블
CREATE TABLE public.users (
  id bigserial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'instructor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. 반(클래스) 테이블
CREATE TABLE public.classes (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  teacher_name text,
  progress text,
  textbook text,
  homework text,
  category text DEFAULT 'regular',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. 성적 테이블 (Daily Report)
CREATE TABLE public.scores (
  id bigserial PRIMARY KEY,
  student_id bigint NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_date text NOT NULL,
  class_name text,
  rt_total integer DEFAULT 0,
  rt_correct integer DEFAULT 0,
  rt_score numeric DEFAULT 0,
  word_total integer DEFAULT 0,
  word_correct integer DEFAULT 0,
  word_score numeric DEFAULT 0,
  rt_details jsonb DEFAULT '[]'::jsonb,
  word_details jsonb DEFAULT '[]'::jsonb,
  assignment_score numeric DEFAULT 0,
  total_score numeric DEFAULT 0,
  average_score numeric DEFAULT 0,
  class_average numeric DEFAULT 0,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, exam_date, class_name)
);

-- 5. 반별 학습 로그 테이블
CREATE TABLE public.class_learning_logs (
  id bigserial PRIMARY KEY,
  class_id bigint NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  log_date text NOT NULL,
  progress text,
  textbook text,
  homework text,
  homework_deadline text,
  created_by text,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, log_date)
);

-- 6. 바이먼스리 성적 테이블
CREATE TABLE public.bimonthly_scores (
  id bigserial PRIMARY KEY,
  student_id bigint NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_date text NOT NULL,
  class_name text,
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_score numeric DEFAULT 0,
  average_score numeric DEFAULT 0,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, exam_date, class_name)
);

-- 7. 상담 일지 테이블
CREATE TABLE public.counseling_logs (
  id bigserial PRIMARY KEY,
  student_id bigint NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  counselor_name text NOT NULL,
  category text DEFAULT '일반상담',
  content text NOT NULL,
  consultation_date date DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Daily Report 카카오 발송 이력
CREATE TABLE public.kakao_send_history (
  id bigserial PRIMARY KEY,
  student_id bigint NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  score_id bigint NOT NULL REFERENCES public.scores(id) ON DELETE CASCADE,
  parent_phone text NOT NULL,
  send_status text NOT NULL,
  send_at timestamptz NOT NULL DEFAULT now(),
  retry_count integer NOT NULL DEFAULT 0,
  error_message text
);

-- 9. Daily Report 성적표 접근 토큰
CREATE TABLE public.report_access (
  id bigserial PRIMARY KEY,
  score_id bigint NOT NULL REFERENCES public.scores(id) ON DELETE CASCADE,
  access_token text NOT NULL UNIQUE,
  student_name text NOT NULL,
  phone_last4 text NOT NULL,
  expires_at timestamptz NOT NULL,
  accessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. 설정 테이블
CREATE TABLE public.settings (
  id bigserial PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. 바이먼스리 성적표 접근 토큰
CREATE TABLE public.bimonthly_report_access (
  id bigserial PRIMARY KEY,
  bimonthly_score_id bigint NOT NULL REFERENCES public.bimonthly_scores(id) ON DELETE CASCADE,
  access_token text NOT NULL UNIQUE,
  student_name text NOT NULL,
  phone_last4 text NOT NULL,
  expires_at timestamptz NOT NULL,
  accessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. 바이먼스리 카카오 발송 이력
CREATE TABLE public.bimonthly_kakao_send_history (
  id bigserial PRIMARY KEY,
  student_id bigint NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  bimonthly_score_id bigint NOT NULL REFERENCES public.bimonthly_scores(id) ON DELETE CASCADE,
  parent_phone text NOT NULL,
  send_status text NOT NULL,
  send_at timestamptz NOT NULL DEFAULT now(),
  retry_count integer NOT NULL DEFAULT 0,
  error_message text
);

-- 13. 예약자 테이블
CREATE TABLE public.reservations (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  visit_date timestamptz NOT NULL,
  school text,
  grade text,
  student_phone text,
  parent_phone text,
  recent_english_score text,
  notes text,
  status text DEFAULT '예약' CHECK (status IN ('예약', '방문완료', '취소', '입학')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 14. 레벨테스트 성적표 테이블
CREATE TABLE public.level_test_scores (
  id bigserial PRIMARY KEY,
  reservation_id bigint NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  test_date text NOT NULL,
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_score numeric DEFAULT 0,
  average_score numeric DEFAULT 0,
  overall_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 15. 레벨테스트 성적표 접근 토큰
CREATE TABLE public.level_test_report_access (
  id bigserial PRIMARY KEY,
  level_test_id bigint NOT NULL REFERENCES public.level_test_scores(id) ON DELETE CASCADE,
  access_token text NOT NULL UNIQUE,
  name text NOT NULL,
  phone_last4 text NOT NULL,
  expires_at timestamptz NOT NULL,
  accessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 16. 예약 안내 알림톡 발송 이력
CREATE TABLE public.reservation_kakao_send_history (
  id bigserial PRIMARY KEY,
  reservation_id bigint NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  parent_phone text NOT NULL,
  send_status text NOT NULL,
  send_at timestamptz NOT NULL DEFAULT now(),
  retry_count integer NOT NULL DEFAULT 0,
  error_message text
);

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

-- ============================================
-- [STEP 3] RLS 정책
-- ============================================
ALTER TABLE public.supplementary_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplementary_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "supp_sessions_full_access" ON public.supplementary_sessions
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "supp_students_full_access" ON public.supplementary_students
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- [STEP 4] 인덱스
-- ============================================
CREATE INDEX idx_students_class_name ON public.students(class_name);
CREATE INDEX idx_students_name ON public.students(name);
CREATE INDEX idx_scores_exam_date ON public.scores(exam_date);
CREATE INDEX idx_scores_class_exam ON public.scores(class_name, exam_date);
CREATE INDEX idx_scores_student_id ON public.scores(student_id);
CREATE INDEX idx_learning_logs_date ON public.class_learning_logs(log_date);
CREATE INDEX idx_counseling_student ON public.counseling_logs(student_id);
CREATE INDEX idx_bimonthly_exam_date ON public.bimonthly_scores(exam_date);
CREATE INDEX idx_bimonthly_class ON public.bimonthly_scores(class_name, exam_date);

-- ============================================
-- [STEP 5] 자동 updated_at 트리거
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

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

-- ============================================
-- [STEP 6] 관리자/강사 계정 등록
-- ============================================

-- admin (원장님) - 비밀번호: admin-password-1234
INSERT INTO public.users (username, password, name, role)
VALUES ('admin', '$2b$10$HLzH96yjA0p/gB3odb3/cOeYfg9YHsYxM81R3SKPhImyQzlILbQX2', '원장님', 'admin');

-- teacher1 (댄T) - 비밀번호: teacher-pass-1
INSERT INTO public.users (username, password, name, role)
VALUES ('teacher1', '$2b$10$.C308q3XcxQoefR3zLIqA.a4epiVkLX2kzxRMd6DGQTaEbYkxIXe6', '댄T', 'instructor');

-- teacher2 (마이크T) - 비밀번호: teacher-pass-2
INSERT INTO public.users (username, password, name, role)
VALUES ('teacher2', '$2b$10$jCEzy3r5fLUEJ.1whL7ule/Y4jqay.yF97mhx6OYxm3tkZFuX2PQu', '마이크T', 'instructor');

-- staff1 (공통1) - 비밀번호: staff-pass-1
INSERT INTO public.users (username, password, name, role)
VALUES ('staff1', '$2b$10$DmOVnMvog6h4Iqw8xwU5e./slbtrKILCOvdRHnPfBwJ7YGBv2lLy2', '공통1', 'instructor');

-- staff2 (공통2) - 비밀번호: staff-pass-2
INSERT INTO public.users (username, password, name, role)
VALUES ('staff2', '$2b$10$wvLLmW7EZtSoGP2GI41HaewmHXhyAaqsGpH3fWanNhbQu8RwelhgW', '공통2', 'instructor');

-- staff3 (공통3) - 비밀번호: staff-pass-3
INSERT INTO public.users (username, password, name, role)
VALUES ('staff3', '$2b$10$WagiccvCvBGtLtrONN6kjem9HVJkEQn/mU0mQxL96A5.4iANh4Ie.', '공통3', 'instructor');

-- ============================================
-- [STEP 7] 스키마 캐시 갱신
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ✅ 완료! 이제 학생 데이터를 입력하시면 됩니다.
