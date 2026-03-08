-- ============================================
-- class_name 필드의 공백 정리 SQL
-- 날짜: 2026-02-23
-- ============================================
-- 학생의 class_name 필드에 있는 불필요한 공백을 제거하여
-- 반 필터링이 정확하게 작동하도록 합니다.
-- 예: "월수 제일3 , 월금 알파2" -> "월수 제일3,월금 알파2"

-- 1. class_name의 앞뒤 공백 제거 및 쉼표 주변 공백 정리
UPDATE public.students
SET 
  class_name = TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(class_name, '\\s*,\\s*', ',', 'g'),  -- 쉼표 주변 공백 제거
      '\\s+', ' ', 'g'  -- 연속된 공백을 하나로
    )
  ),
  updated_at = NOW()
WHERE 
  class_name IS NOT NULL 
  AND (
    -- 앞뒤 공백이 있거나
    class_name != TRIM(class_name)
    OR
    -- 쉼표 주변에 공백이 있는 경우
    class_name ~ '\\s*,\\s*'
    OR
    -- 연속된 공백이 있는 경우
    class_name ~ '\\s{2,}'
  );

-- 2. 빈 문자열이나 공백만 있는 class_name을 NULL로 변경
UPDATE public.students
SET 
  class_name = NULL,
  updated_at = NOW()
WHERE 
  class_name IS NOT NULL 
  AND TRIM(class_name) = '';

-- 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';

-- 확인 쿼리 (실행 후 결과 확인용)
-- SELECT id, name, class_name FROM public.students WHERE class_name LIKE '%,%' ORDER BY name;
