-- Supabase (Postgres) schema for exam-report

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

create table if not exists public.scores (
  id bigserial primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  exam_date text not null,
  class_name text,
  rt_total integer,
  rt_correct integer,
  rt_score numeric,
  word_total integer,
  word_correct integer,
  word_score numeric,
  rt_details jsonb default '[]'::jsonb,
  word_details jsonb default '[]'::jsonb,
  assignment_score numeric,
  total_score numeric,
  average_score numeric,
  class_average numeric,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, exam_date, class_name)
);

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

create table if not exists public.settings (
  id bigserial primary key,
  key text not null unique,
  value text,
  updated_at timestamptz not null default now()
);

-- 반(클래스) 테이블
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

-- 반별 일자별 학습 로그 테이블
create table if not exists public.class_learning_logs (
  id bigserial primary key,
  class_id bigint not null references public.classes(id) on delete cascade,
  log_date text not null, -- 'YYYY-MM-DD' 형식
  progress text,
  textbook text,
  homework text,
  homework_deadline text, -- 숙제 검사 예정일 추가
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, log_date)
);

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

-- 사용자(관리자/강사) 테이블
create table if not exists public.users (
  id bigserial primary key,
  username text not null unique,
  password text not null,
  name text not null,
  role text not null check (role in ('admin', 'instructor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 학원비 결제 기록 테이블 (삭제됨)
-- create table if not exists public.payments ( ... );

create index if not exists idx_students_parent_phone on public.students(parent_phone);
create index if not exists idx_users_username on public.users(username);
create index if not exists idx_payments_student_id on public.payments(student_id);
create index if not exists idx_payments_billing_month on public.payments(billing_month);
create index if not exists idx_scores_student_date on public.scores(student_id, exam_date);
create index if not exists idx_scores_class_date on public.scores(class_name, exam_date);
create index if not exists idx_report_access_token on public.report_access(access_token);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists trg_scores_updated_at on public.scores;
create trigger trg_scores_updated_at
before update on public.scores
for each row execute function public.set_updated_at();

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_classes_updated_at on public.classes;
create trigger trg_classes_updated_at
before update on public.classes
for each row execute function public.set_updated_at();

drop trigger if exists trg_counseling_logs_updated_at on public.counseling_logs;
create trigger trg_counseling_logs_updated_at
before update on public.counseling_logs
for each row execute function public.set_updated_at();

drop trigger if exists trg_class_learning_logs_updated_at on public.class_learning_logs;
create trigger trg_class_learning_logs_updated_at
before update on public.class_learning_logs
for each row execute function public.set_updated_at();
