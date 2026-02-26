-- 학생 테이블에 created_at 컬럼이 없거나 NULL인 경우를 대비한 스크립트
-- 이미 컬럼이 있으면 무시되고, NULL인 경우만 업데이트합니다.

-- 1. created_at 컬럼이 없으면 추가 (이미 있으면 무시)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS created_at timestamptz;

-- 2. created_at이 NULL인 경우 기본값 설정 (현재 시각으로)
-- 주의: 기존 데이터의 경우 id 순서대로 과거 날짜를 부여하거나, 현재 시각으로 설정할 수 있습니다.
-- 여기서는 현재 시각으로 설정합니다. 과거 날짜를 원하면 아래 주석 처리된 쿼리를 사용하세요.

-- 옵션 1: NULL인 경우 현재 시각으로 설정
UPDATE public.students 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- 옵션 2 (선택사항): NULL인 경우 id 기반으로 과거 날짜 부여 (예: 2024-01-01부터 하루씩 증가)
-- UPDATE public.students 
-- SET created_at = ('2024-01-01'::date + (id || ' days')::interval)::timestamptz
-- WHERE created_at IS NULL;

-- 3. NOT NULL 제약조건 추가 (이미 있으면 무시)
ALTER TABLE public.students ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.students ALTER COLUMN created_at SET DEFAULT NOW();

-- 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';
