-- Supabase (Postgres) schema for exam-report

create table if not exists public.students (
  id bigserial primary key,
  name text not null,
  grade text,
  class_name text,
  phone text,
  parent_name text,
  parent_phone text not null,
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
  assignment_score numeric,
  attitude_score numeric,
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

create index if not exists idx_students_parent_phone on public.students(parent_phone);
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
