-- [독강영어학원 ERP] 최종 통합 데이터베이스 스키마
-- 날짜: 2026-02-02

-- 1. 학생 테이블
create table if not exists public.students (
  id bigserial primary key,
  name text not null,
  grade text,
  class_name text,
  phone text,
  parent_name text,
  parent_phone text not null,
  school text,
  teacher_name text,
  monthly_tuition integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. 사용자(관리자/강사) 테이블
create table if not exists public.users (
  id bigserial primary key,
  username text not null unique,
  password text not null,
  name text not null,
  role text not null check (role in ('admin', 'instructor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. 반(클래스) 테이블
create table if not exists public.classes (
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

-- 4. 성적 테이블
create table if not exists public.scores (
  id bigserial primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  exam_date text not null, -- 'YY-MM-DD' 형식
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
create table if not exists public.class_learning_logs (
  id bigserial primary key,
  class_id bigint not null references public.classes(id) on delete cascade,
  log_date text not null, -- 'YYYY-MM-DD' 형식
  progress text,
  textbook text,
  homework text,
  homework_deadline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, log_date)
);

-- 6. 상담 일지 테이블
create table if not exists public.counseling_logs (
  id bigserial primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  counselor_name text not null,
  category text default '일반상담',
  content text not null,
  consultation_date date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. 카카오 발송 이력 테이블
create table if not exists public.kakao_send_history (
  id bigserial primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  score_id bigint not null references public.scores(id) on delete cascade,
  parent_phone text not null,
  send_status text not null,
  send_at timestamptz not null default now(),
  retry_count integer not null default 0,
  error_message text
);

-- 8. 성적표 접근 토큰 테이블
create table if not exists public.report_access (
  id bigserial primary key,
  score_id bigint not null references public.scores(id) on delete cascade,
  access_token text not null unique,
  student_name text not null,
  phone_last4 text not null,
  expires_at timestamptz not null,
  accessed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 9. 설정 테이블
create table if not exists public.settings (
  id bigserial primary key,
  key text not null unique,
  value text,
  updated_at timestamptz not null default now()
);

-- [성능 최적화] 인덱스 설정
create index if not exists idx_students_class_name on public.students(class_name);
create index if not exists idx_scores_exam_date on public.scores(exam_date);
create index if not exists idx_scores_class_exam on public.scores(class_name, exam_date);
create index if not exists idx_learning_logs_date on public.class_learning_logs(log_date);
create index if not exists idx_counseling_student on public.counseling_logs(student_id);

-- [자동화] updated_at 트리거 함수
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 트리거 적용
do $$
declare
  t text;
begin
  for t in select table_name from information_schema.tables where table_schema = 'public' and table_name in ('students', 'users', 'classes', 'scores', 'class_learning_logs', 'counseling_logs', 'settings')
  loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end;
$$;
