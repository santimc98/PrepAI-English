-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  display_name text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles: owner select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: owner upsert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: owner update" on public.profiles
  for update using (auth.uid() = id);

-- EXAMS (plantillas o metadata básica)
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users(id),
  title text not null,
  level text,
  blueprint jsonb,
  created_at timestamptz default now()
);
alter table public.exams enable row level security;
create policy "exams: readable for all" on public.exams
  for select using (true);
create policy "exams: owner all" on public.exams
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

-- ATTEMPTS
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid references public.exams(id),
  exam_snapshot jsonb,
  score numeric,
  started_at timestamptz default now(),
  finished_at timestamptz
);
alter table public.attempts enable row level security;
create policy "attempts: owner all" on public.attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ATTEMPT_ANSWERS
create table if not exists public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id text not null,
  answer jsonb,
  correct boolean,
  points numeric
);
alter table public.attempt_answers enable row level security;
create policy "answers: by attempt owner all" on public.attempt_answers
  for all using (
    exists(select 1 from public.attempts a
           where a.id = attempt_id and a.user_id = auth.uid())
  )
  with check (
    exists(select 1 from public.attempts a
           where a.id = attempt_id and a.user_id = auth.uid())
  );
