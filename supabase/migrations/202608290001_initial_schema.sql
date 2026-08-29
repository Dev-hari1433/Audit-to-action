create extension if not exists pgcrypto;

create type public.user_role as enum ('CITIZEN', 'AUDITOR', 'BUILDING_MANAGER', 'ADMIN');
create type public.issue_status as enum ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'VERIFICATION_PENDING', 'VERIFIED', 'REWORK_REQUIRED', 'OVERDUE', 'ESCALATED', 'CLOSED');
create type public.severity_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
create type public.audit_result as enum ('COMPLIANT', 'PARTIALLY_COMPLIANT', 'NOT_COMPLIANT', 'NOT_APPLICABLE');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role public.user_role not null default 'CITIZEN',
  phone text,
  department text,
  created_at timestamptz not null default now()
);

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  ownership text not null check (ownership in ('Government', 'Private')),
  address text not null,
  city text not null default 'Chennai',
  latitude double precision,
  longitude double precision,
  organisation text,
  contact_name text,
  contact_email text,
  created_at timestamptz not null default now()
);

create table public.audits (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  auditor_id uuid references public.profiles(id),
  audit_date date not null default current_date,
  status text not null default 'DRAFT',
  score integer check (score between 0 and 100),
  notes text,
  created_at timestamptz not null default now()
);

create table public.audit_items (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  category text not null,
  requirement text not null,
  result public.audit_result not null,
  severity public.severity_level,
  notes text,
  suggested_corrective_action text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  issue_number text not null unique,
  building_id uuid not null references public.buildings(id) on delete cascade,
  audit_id uuid references public.audits(id) on delete set null,
  title text not null,
  description text not null,
  category text not null,
  severity public.severity_level not null,
  status public.issue_status not null default 'PENDING',
  responsible_user_id uuid references public.profiles(id) on delete set null,
  responsible_department text,
  deadline date,
  action_required text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  uploaded_by uuid references public.profiles(id),
  file_url text not null,
  file_type text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  verifier_id uuid not null references public.profiles(id),
  result text not null check (result in ('APPROVED', 'REWORK_REQUIRED')),
  comments text not null,
  verified_at timestamptz not null default now()
);

create table public.citizen_reports (
  id uuid primary key default gen_random_uuid(),
  report_number text not null unique,
  reporter_id uuid references public.profiles(id) on delete set null,
  building_id uuid not null references public.buildings(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  photo_url text,
  latitude double precision,
  longitude double precision,
  location_text text,
  status text not null default 'SUBMITTED',
  created_at timestamptz not null default now()
);

create table public.escalations (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  level integer not null check (level between 1 and 3),
  escalated_to text not null,
  reason text not null,
  escalated_at timestamptz not null default now(),
  status text not null default 'ACTIVE'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'INFO',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.ai_analysis (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references public.issues(id) on delete cascade,
  analysis_type text not null,
  result jsonb not null,
  confidence numeric(5,2),
  created_at timestamptz not null default now()
);

create index issues_building_id_idx on public.issues(building_id);
create index issues_status_idx on public.issues(status);
create index issues_deadline_idx on public.issues(deadline);
create index evidence_issue_id_idx on public.evidence(issue_id);
create index reports_building_id_idx on public.citizen_reports(building_id);

alter table public.profiles enable row level security;
alter table public.buildings enable row level security;
alter table public.audits enable row level security;
alter table public.audit_items enable row level security;
alter table public.issues enable row level security;
alter table public.evidence enable row level security;
alter table public.verifications enable row level security;
alter table public.citizen_reports enable row level security;
alter table public.escalations enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_analysis enable row level security;

create function public.current_role() returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "Public can view buildings" on public.buildings for select using (true);
create policy "Public can view verified issue summaries" on public.issues for select using (status in ('VERIFIED', 'CLOSED') or auth.uid() is not null);
create policy "Admins manage buildings" on public.buildings for all using (public.current_role() = 'ADMIN') with check (public.current_role() = 'ADMIN');
create policy "Profiles view own record" on public.profiles for select using (id = auth.uid() or public.current_role() = 'ADMIN');
create policy "Profiles update own record" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Staff view audits" on public.audits for select using (public.current_role() in ('AUDITOR', 'ADMIN', 'BUILDING_MANAGER'));
create policy "Auditors create audits" on public.audits for insert with check (auditor_id = auth.uid() and public.current_role() in ('AUDITOR', 'ADMIN'));
create policy "Staff view audit items" on public.audit_items for select using (public.current_role() in ('AUDITOR', 'ADMIN', 'BUILDING_MANAGER'));
create policy "Auditors manage own audit items" on public.audit_items for all using (exists (select 1 from public.audits a where a.id = audit_id and (a.auditor_id = auth.uid() or public.current_role() = 'ADMIN')));
create policy "Admins update issues" on public.issues for update using (public.current_role() = 'ADMIN');
create policy "Managers update assigned issues" on public.issues for update using (responsible_user_id = auth.uid() and public.current_role() = 'BUILDING_MANAGER');
create policy "Staff view evidence" on public.evidence for select using (public.current_role() in ('AUDITOR', 'ADMIN', 'BUILDING_MANAGER'));
create policy "Managers upload evidence" on public.evidence for insert with check (uploaded_by = auth.uid() and public.current_role() in ('BUILDING_MANAGER', 'ADMIN'));
create policy "Auditors manage verifications" on public.verifications for all using (verifier_id = auth.uid() and public.current_role() in ('AUDITOR', 'ADMIN'));
create policy "Anyone submits citizen reports" on public.citizen_reports for insert with check (reporter_id is null or reporter_id = auth.uid());
create policy "Citizens view own reports" on public.citizen_reports for select using (reporter_id = auth.uid() or public.current_role() in ('AUDITOR', 'ADMIN'));
create policy "Admins view escalations" on public.escalations for select using (public.current_role() = 'ADMIN');
create policy "Users view own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Staff view AI advice" on public.ai_analysis for select using (public.current_role() in ('AUDITOR', 'ADMIN', 'BUILDING_MANAGER'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('accessibility-evidence', 'accessibility-evidence', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

create policy "Authenticated users upload evidence files" on storage.objects for insert to authenticated with check (bucket_id = 'accessibility-evidence');
create policy "Authenticated users read evidence files" on storage.objects for select to authenticated using (bucket_id = 'accessibility-evidence');
