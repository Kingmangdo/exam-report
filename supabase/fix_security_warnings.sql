-- ============================================
-- Supabase Security Warnings & Errors 해결 스크립트
-- 날짜: 2026-02-23
-- ============================================
-- ⚠️ 이 스크립트는 모든 보안 취약점을 해결합니다.
-- Supabase SQL Editor에서 실행하세요.

-- ============================================
-- [WARNING 1] Function Search Path Mutable
-- ============================================
-- set_updated_at 함수에 search_path 설정 추가
-- 이렇게 하면 함수 실행 시 search_path가 변경되지 않아 보안 취약점을 방지합니다.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- ============================================
-- [WARNING 2 & 3] RLS Policy Always True
-- ============================================
-- supplementary_sessions와 supplementary_students 테이블의 
-- 항상 true인 RLS 정책을 서비스 역할만 접근 가능하도록 변경

-- 기존 정책 삭제
DROP POLICY IF EXISTS "supp_sessions_full_access" ON public.supplementary_sessions;
DROP POLICY IF EXISTS "supp_students_full_access" ON public.supplementary_students;
DROP POLICY IF EXISTS "supp_sessions_full_access_v2" ON public.supplementary_sessions;
DROP POLICY IF EXISTS "supp_students_full_access_v2" ON public.supplementary_sessions;

-- 새로운 보안 정책 생성 (서비스 역할만 접근 가능)
CREATE POLICY "supp_sessions_service_role_only" ON public.supplementary_sessions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "supp_students_service_role_only" ON public.supplementary_students
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- [ERROR] RLS Disabled in Public (17개 테이블)
-- ============================================
-- 모든 public 테이블에 RLS 활성화 및 서비스 역할 정책 생성

-- 1. students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "students_service_role_only" ON public.students;
CREATE POLICY "students_service_role_only" ON public.students
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 2. users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_service_role_only" ON public.users;
CREATE POLICY "users_service_role_only" ON public.users
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 3. classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "classes_service_role_only" ON public.classes;
CREATE POLICY "classes_service_role_only" ON public.classes
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 4. scores
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "scores_service_role_only" ON public.scores;
CREATE POLICY "scores_service_role_only" ON public.scores
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 5. class_learning_logs
ALTER TABLE public.class_learning_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "class_learning_logs_service_role_only" ON public.class_learning_logs;
CREATE POLICY "class_learning_logs_service_role_only" ON public.class_learning_logs
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 6. bimonthly_scores
ALTER TABLE public.bimonthly_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bimonthly_scores_service_role_only" ON public.bimonthly_scores;
CREATE POLICY "bimonthly_scores_service_role_only" ON public.bimonthly_scores
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 7. counseling_logs
ALTER TABLE public.counseling_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "counseling_logs_service_role_only" ON public.counseling_logs;
CREATE POLICY "counseling_logs_service_role_only" ON public.counseling_logs
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 8. kakao_send_history
ALTER TABLE public.kakao_send_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kakao_send_history_service_role_only" ON public.kakao_send_history;
CREATE POLICY "kakao_send_history_service_role_only" ON public.kakao_send_history
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 9. report_access
ALTER TABLE public.report_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "report_access_service_role_only" ON public.report_access;
CREATE POLICY "report_access_service_role_only" ON public.report_access
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 10. bimonthly_report_access
ALTER TABLE public.bimonthly_report_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bimonthly_report_access_service_role_only" ON public.bimonthly_report_access;
CREATE POLICY "bimonthly_report_access_service_role_only" ON public.bimonthly_report_access
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 11. bimonthly_kakao_send_history
ALTER TABLE public.bimonthly_kakao_send_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bimonthly_kakao_send_history_service_role_only" ON public.bimonthly_kakao_send_history;
CREATE POLICY "bimonthly_kakao_send_history_service_role_only" ON public.bimonthly_kakao_send_history
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 12. reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reservations_service_role_only" ON public.reservations;
CREATE POLICY "reservations_service_role_only" ON public.reservations
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 13. level_test_scores
ALTER TABLE public.level_test_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "level_test_scores_service_role_only" ON public.level_test_scores;
CREATE POLICY "level_test_scores_service_role_only" ON public.level_test_scores
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 14. level_test_report_access
ALTER TABLE public.level_test_report_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "level_test_report_access_service_role_only" ON public.level_test_report_access;
CREATE POLICY "level_test_report_access_service_role_only" ON public.level_test_report_access
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 15. reservation_kakao_send_history
ALTER TABLE public.reservation_kakao_send_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reservation_kakao_send_history_service_role_only" ON public.reservation_kakao_send_history;
CREATE POLICY "reservation_kakao_send_history_service_role_only" ON public.reservation_kakao_send_history
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 16. settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_service_role_only" ON public.settings;
CREATE POLICY "settings_service_role_only" ON public.settings
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- [ERROR] Sensitive Columns Exposed
-- ============================================
-- 위의 RLS 정책으로 이미 보호되지만, 추가로 명시적으로 확인
-- report_access, bimonthly_report_access, level_test_report_access, users 테이블의
-- access_token과 password 컬럼은 RLS로 보호됩니다.

-- 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';
