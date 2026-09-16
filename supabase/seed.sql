-- Supabase Seed Data for AccessTrack Chennai Accessibility Pilot

-- 1. Executing Departments
insert into public.departments (id, name, type, contact_name, email, phone)
values
  ('11111111-1111-1111-1111-111111110001', 'Hospital Engineering', 'Healthcare Infrastructure', 'Kavitha Mani', 'kavitha.mani@chennai-health.gov.in', '+91 94441 23456'),
  ('11111111-1111-1111-1111-111111110002', 'Public Works Department', 'Civil Works Wing', 'Ramesh Iyer', 'ramesh.pwd@tn.gov.in', '+91 94442 34567'),
  ('11111111-1111-1111-1111-111111110003', 'Building Administration', 'Facilities Management', 'Anitha Parthiban', 'anitha.admin@civic.tn.gov.in', '+91 94443 45678'),
  ('11111111-1111-1111-1111-111111110004', 'Transit Infrastructure', 'Metro & Bus Transport', 'Murugan Selvam', 'murugan@chennaitransit.gov.in', '+91 94444 56789'),
  ('11111111-1111-1111-1111-111111110005', 'Municipal Corporation Works', 'GCC Zone Works', 'Suresh Babu', 'suresh.works@chennaicorp.gov.in', '+91 94445 67890')
on conflict (id) do nothing;

-- 2. Buildings (20 Monitored Pilot Buildings)
insert into public.buildings (id, name, type, ownership, address, city, latitude, longitude, organisation)
values
  ('22222222-2222-2222-2222-222222220001', 'Government General Hospital', 'Hospital', 'Government', '18, Civic Campus Road, George Town', 'Chennai', 13.0815, 80.2771, 'Greater Chennai Corporation'),
  ('22222222-2222-2222-2222-222222220002', 'Anna Nagar Government College', 'College', 'Government', '19, Civic Campus Road, Anna Nagar', 'Chennai', 13.0850, 80.2101, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220003', 'Teynampet Corporation Office', 'Government Office', 'Government', '20, Civic Campus Road, Teynampet', 'Chennai', 13.0444, 80.2498, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220004', 'Marina Public Library', 'Public Institution', 'Government', '21, Civic Campus Road, Marina', 'Chennai', 13.0548, 80.2823, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220005', 'Mylapore Higher Secondary School', 'School', 'Government', '22, Civic Campus Road, Mylapore', 'Chennai', 13.0339, 80.2698, 'Greater Chennai Corporation'),
  ('22222222-2222-2222-2222-222222220006', 'South Chennai District Office', 'Government Office', 'Government', '23, Civic Campus Road, Guindy', 'Chennai', 12.9840, 80.2180, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220007', 'Perambur Community Health Centre', 'Hospital', 'Government', '24, Civic Campus Road, Perambur', 'Chennai', 13.1180, 80.2320, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220008', 'Velachery Citizen Service Centre', 'Public Institution', 'Government', '25, Civic Campus Road, Velachery', 'Chennai', 12.9815, 80.2180, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220009', 'Royapettah Arts College', 'College', 'Government', '26, Civic Campus Road, Royapettah', 'Chennai', 13.0550, 80.2630, 'Greater Chennai Corporation'),
  ('22222222-2222-2222-2222-222222220010', 'Guindy Industrial Training Institute', 'College', 'Government', '27, Civic Campus Road, Guindy', 'Chennai', 13.0105, 80.2130, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220011', 'Adyar Learning Centre', 'School', 'Private', '28, Civic Campus Road, Adyar', 'Chennai', 13.0068, 80.2570, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220012', 'Kodambakkam Civic Hall', 'Public Institution', 'Government', '29, Civic Campus Road, Kodambakkam', 'Chennai', 13.0520, 80.2260, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220013', 'Egmore Women’s Resource Centre', 'Public Institution', 'Government', '30, Civic Campus Road, Egmore', 'Chennai', 13.0730, 80.2610, 'Greater Chennai Corporation'),
  ('22222222-2222-2222-2222-222222220014', 'Nungambakkam Community Clinic', 'Private Hospital', 'Private', '31, Civic Campus Road, Nungambakkam', 'Chennai', 13.0610, 80.2410, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220015', 'Saidapet Taluk Office', 'Government Office', 'Government', '32, Civic Campus Road, Saidapet', 'Chennai', 13.0210, 80.2230, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220016', 'Thiruvanmiyur Public School', 'School', 'Government', '33, Civic Campus Road, Thiruvanmiyur', 'Chennai', 12.9840, 80.2590, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220017', 'Kilpauk Rehabilitation Centre', 'Hospital', 'Government', '34, Civic Campus Road, Kilpauk', 'Chennai', 13.0830, 80.2420, 'Greater Chennai Corporation'),
  ('22222222-2222-2222-2222-222222220018', 'Washermanpet Skills Centre', 'College', 'Government', '35, Civic Campus Road, Washermanpet', 'Chennai', 13.1130, 80.2860, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220019', 'Porur Community Hall', 'Public Institution', 'Government', '36, Civic Campus Road, Porur', 'Chennai', 13.0350, 80.1570, 'Tamil Nadu Public Services Pilot'),
  ('22222222-2222-2222-2222-222222220020', 'Sholinganallur Service Hub', 'Government Office', 'Government', '37, Civic Campus Road, OMR', 'Chennai', 12.9010, 80.2270, 'Tamil Nadu Public Services Pilot')
on conflict (id) do nothing;

-- 3. Fictional Accessibility Audits
insert into public.audits (building_id, audit_date, status, score, notes)
select id, current_date - ((row_number() over ())::int * interval '7 days'), 'COMPLETED', 55 + ((row_number() over ())::int % 40), 'Official baseline accessibility audit.'
from public.buildings limit 20;

-- 4. 120 Pilot Issues Across 20 Buildings
insert into public.issues (issue_number, building_id, title, description, category, severity, status, responsible_department, deadline, action_required)
select
  'ACC-' || (1023 + series)::text,
  (select id from public.buildings order by name offset ((series - 1) % 20) limit 1),
  case series % 5
    when 0 then 'No wheelchair ramp at main entrance'
    when 1 then 'Accessible toilet grab bars incomplete'
    when 2 then 'Tactile pathway is interrupted'
    when 3 then 'Accessible parking bay not marked'
    else 'Directional signage lacks tactile information'
  end,
  'Harmonised Guidelines non-compliance observation identified during pilot survey.',
  case series % 5
    when 0 then 'ENTRANCE'
    when 1 then 'TOILETS'
    when 2 then 'MOVEMENT'
    when 3 then 'PARKING'
    else 'COMMUNICATION'
  end,
  case series % 4
    when 0 then 'HIGH'::public.severity_level
    when 1 then 'MEDIUM'::public.severity_level
    when 2 then 'LOW'::public.severity_level
    else 'CRITICAL'::public.severity_level
  end,
  case
    when series <= 70 then 'CLOSED'::public.issue_status
    when series <= 100 then 'IN_PROGRESS'::public.issue_status
    when series <= 110 then 'OVERDUE'::public.issue_status
    else 'PENDING'::public.issue_status
  end,
  case series % 5
    when 0 then 'Hospital Engineering'
    when 1 then 'Public Works Department'
    when 2 then 'Building Administration'
    when 3 then 'Transit Infrastructure'
    else 'Municipal Corporation Works'
  end,
  current_date + case when series between 101 and 110 then -8 else 20 end,
  'Execute corrective engineering fix and provide live camera verification proof.'
from generate_series(1, 120) as series;

-- 5. Initial Rewards & Recognitions
insert into public.rewards (building_id, reward_type, description, date)
values
  ('22222222-2222-2222-2222-222222220008', 'Compliance Recognition', 'Achieved exemplary 91% monitoring score with full tactile paving and automated wheelchair lift.', '2026-08-15'),
  ('22222222-2222-2222-2222-222222220004', 'Accessibility Improvement Badge', 'Successfully added audio wayfinding signage and unobstructed ramp access for visually impaired citizens.', '2026-07-28'),
  ('22222222-2222-2222-2222-222222220011', 'Certificate', 'Recognized for universal accessible restrooms across all student wings.', '2026-06-12');

-- 6. Initial Penalties & Formal Notices
insert into public.penalties (building_id, responsible_department, penalty_type, amount, reason, authority_note, date, status)
values
  ('22222222-2222-2222-2222-222222220001', 'Hospital Engineering', 'Notice', 25000.00, 'Main entrance ramp construction overdue by 12 days beyond statutory deadline.', 'First formal notice issued. 14 days granted before administrative escalation.', '2026-08-25', 'ISSUED'),
  ('22222222-2222-2222-2222-222222220015', 'Municipal Corporation Works', 'Warning', null, 'Ground floor accessible restroom repeatedly locked during public operational hours.', 'Administrative inspection verified citizen complaint ACC-2026-00108.', '2026-08-20', 'ISSUED');

-- 7. Auditor Field Reports
insert into public.auditor_reports (auditor_name, reporting_period, buildings_visited, complaints_reviewed, issues_identified, issues_solved, issues_pending, overdue_issues, major_barriers, recommendations, notes)
values
  ('Arun Selvan', 'Q2 2026 (Apr - Jun)', 14, 25, 32, 24, 8, 2, 'Predominance of step-only public entrances in legacy healthcare buildings.', 'Prioritize standardized modular ramp construction and enforce tactile feedback on public lift installations.', 'Follow-up required with Hospital Engineering on ACC-1024.'),
  ('Arun Selvan', 'Q1 2026 (Jan - Mar)', 12, 19, 28, 21, 7, 1, 'Missing tactile guiding paths along bus terminal corridors and outpatient wings.', 'Implement continuous 300mm warning tactile tiles at all stair heads and ramp transitions.', 'All government colleges surveyed achieved over 60% compliance.');

-- 8. Admin Activity Logs
insert into public.admin_activity_logs (admin_id, admin_name, action, target_type, target_id, description)
values
  (null, 'Priya Raman', 'REASSIGN_AUDITOR', 'AUDITOR', 'aud-01', 'Reassigned 2 healthcare facilities to Divya K to alleviate verification backlog.'),
  (null, 'Priya Raman', 'ISSUE_PENALTY', 'BUILDING', 'bld-01', 'Issued formal remediation notice to Hospital Engineering for overdue entrance ramp.'),
  (null, 'Priya Raman', 'AWARD_BADGE', 'BUILDING', 'bld-08', 'Conferred Compliance Recognition to Velachery Citizen Service Centre for 91% rating.');
