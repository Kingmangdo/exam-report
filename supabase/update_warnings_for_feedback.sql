-- ============================================
-- [독강영어학원 ERP] 학습 경고 테이블 확장 (밀착 케어 피드백용)
-- ============================================

-- 1. 할당된 선생님들 (배열 또는 콤마 구분 문자열 형태를 위해 text 배열이나 JSONB 사용 추천, 여기서는 다중 지정 및 확장을 고려하여 JSONB 사용)
ALTER TABLE public.academic_warnings 
ADD COLUMN IF NOT EXISTS assigned_teachers jsonb DEFAULT '[]'::jsonb;

-- 2. 선생님들의 피드백 (어떤 선생님이 어떤 이유/해결방안을 적었는지 구조화하여 저장)
-- 예: [{"teacher": "댄T", "reason": "...", "solution": "...", "updated_at": "..."}]
ALTER TABLE public.academic_warnings 
ADD COLUMN IF NOT EXISTS teacher_feedback jsonb DEFAULT '[]'::jsonb;

-- 3. 원장님이 직접 수정한 등락 추이 (null이면 기존 시스템 생성 message를 보여주고, 값이 있으면 이것을 보여줌)
ALTER TABLE public.academic_warnings 
ADD COLUMN IF NOT EXISTS custom_message text;

-- 4. 처리 상태 구분 (선생님 할당됨, 피드백 완료됨 등을 명확히 하기 위해)
-- status: 'pending'(대기중), 'assigned'(할당됨), 'feedback_completed'(강사 피드백 완료), 'resolved'(원장님 최종 확인/종료)
ALTER TABLE public.academic_warnings 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 기존 is_acknowledged 데이터를 status로 마이그레이션
UPDATE public.academic_warnings 
SET status = 'resolved' 
WHERE is_acknowledged = true;
