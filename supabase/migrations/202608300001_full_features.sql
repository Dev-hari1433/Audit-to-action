-- Migration: 202608300001_full_features.sql
-- Description: Adds departments, rewards, penalties, auditor field reports, admin logs, and complaint follow-ups

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  issue_id uuid references public.issues(id) on delete set null,
  reward_type text not null check (reward_type in ('Accessibility Improvement Badge', 'Compliance Recognition', 'Certificate', 'Performance Recognition')),
  description text not null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.penalties (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  issue_id uuid references public.issues(id) on delete set null,
  responsible_department text not null,
  penalty_type text not null check (penalty_type in ('Warning', 'Notice', 'Administrative action', 'Fine / Penalty', 'Other')),
  amount numeric(10,2),
  reason text not null,
  authority_note text not null,
  status text not null default 'ISSUED' check (status in ('ISSUED', 'RESOLVED', 'APPEALED')),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.auditor_reports (
  id uuid primary key default gen_random_uuid(),
  auditor_id uuid references public.profiles(id),
  auditor_name text not null,
  reporting_period text not null,
  buildings_visited integer not null default 0,
  complaints_reviewed integer not null default 0,
  issues_identified integer not null default 0,
  issues_solved integer not null default 0,
  issues_pending integer not null default 0,
  overdue_issues integer not null default 0,
  major_barriers text not null,
  recommendations text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id),
  admin_name text not null,
  action text not null,
  target_type text not null,
  target_id text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.complaint_followups (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.citizen_reports(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  description text not null,
  photo_url text,
  photo_count integer not null default 1,
  voice_text text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists rewards_building_id_idx on public.rewards(building_id);
create index if not exists penalties_building_id_idx on public.penalties(building_id);
create index if not exists auditor_reports_auditor_id_idx on public.auditor_reports(auditor_id);
create index if not exists admin_logs_created_at_idx on public.admin_activity_logs(created_at desc);
create index if not exists complaint_followups_complaint_id_idx on public.complaint_followups(complaint_id);

-- Enable RLS
alter table public.departments enable row level security;
alter table public.rewards enable row level security;
alter table public.penalties enable row level security;
alter table public.auditor_reports enable row level security;
alter table public.admin_activity_logs enable row level security;
alter table public.complaint_followups enable row level security;

-- Policies
create policy "Public can view departments" on public.departments for select using (true);
create policy "Admins manage departments" on public.departments for all using (private.current_role() = 'ADMIN') with check (private.current_role() = 'ADMIN');

create policy "Public can view rewards and badges" on public.rewards for select using (true);
create policy "Admins manage rewards" on public.rewards for all using (private.current_role() = 'ADMIN') with check (private.current_role() = 'ADMIN');

create policy "Staff view penalties" on public.penalties for select using (private.current_role() in ('AUDITOR', 'ADMIN', 'BUILDING_MANAGER'));
create policy "Admins manage penalties" on public.penalties for all using (private.current_role() = 'ADMIN') with check (private.current_role() = 'ADMIN');

create policy "Staff view auditor reports" on public.auditor_reports for select using (private.current_role() in ('AUDITOR', 'ADMIN'));
create policy "Auditors create reports" on public.auditor_reports for insert with check (private.current_role() in ('AUDITOR', 'ADMIN'));

create policy "Admins view activity logs" on public.admin_activity_logs for select using (private.current_role() = 'ADMIN');
create policy "Admins create activity logs" on public.admin_activity_logs for insert with check (private.current_role() = 'ADMIN');

create policy "Users view complaint followups" on public.complaint_followups for select using (
  exists (
    select 1 from public.citizen_reports r
    where r.id = complaint_id and (r.reporter_id = (select auth.uid()) or private.current_role() in ('AUDITOR', 'ADMIN'))
  )
);
create policy "Authenticated users create followups" on public.complaint_followups for insert to authenticated with check (
  user_id = (select auth.uid()) or private.current_role() in ('CITIZEN', 'AUDITOR', 'ADMIN')
);

-- Grants
grant select on public.departments, public.rewards to anon, authenticated;
grant select on public.penalties to authenticated;
grant select, insert on public.auditor_reports, public.complaint_followups to authenticated;
grant select, insert on public.admin_activity_logs to authenticated;
