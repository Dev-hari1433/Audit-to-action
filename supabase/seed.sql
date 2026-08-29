insert into public.buildings (id, name, type, ownership, address, city, latitude, longitude, organisation)
select gen_random_uuid(), name, type, ownership, (row_number() over ())::text || ', Civic Campus Road', 'Chennai', lat, lng, 'Tamil Nadu Public Services Pilot'
from (values
  ('Government General Hospital','Hospital','Government',13.0815,80.2771),
  ('Anna Nagar Government College','College','Government',13.0850,80.2101),
  ('Teynampet Corporation Office','Government Office','Government',13.0444,80.2498),
  ('Marina Public Library','Public Institution','Government',13.0548,80.2823),
  ('Mylapore Higher Secondary School','School','Government',13.0339,80.2698),
  ('South Chennai District Office','Government Office','Government',12.9840,80.2180),
  ('Perambur Community Health Centre','Hospital','Government',13.1180,80.2320),
  ('Velachery Citizen Service Centre','Public Institution','Government',12.9815,80.2180),
  ('Royapettah Arts College','College','Government',13.0550,80.2630),
  ('Guindy Industrial Training Institute','College','Government',13.0105,80.2130),
  ('Adyar Learning Centre','School','Private',13.0068,80.2570),
  ('Kodambakkam Civic Hall','Public Institution','Government',13.0520,80.2260),
  ('Egmore Women''s Resource Centre','Public Institution','Government',13.0730,80.2610),
  ('Nungambakkam Community Clinic','Private Hospital','Private',13.0610,80.2410),
  ('Saidapet Taluk Office','Government Office','Government',13.0210,80.2230),
  ('Thiruvanmiyur Public School','School','Government',12.9840,80.2590),
  ('Kilpauk Rehabilitation Centre','Hospital','Government',13.0830,80.2420),
  ('Washermanpet Skills Centre','College','Government',13.1130,80.2860),
  ('Porur Community Hall','Public Institution','Government',13.0350,80.1570),
  ('Sholinganallur Service Hub','Government Office','Government',12.9010,80.2270)
) as sample(name,type,ownership,lat,lng);

insert into public.audits (building_id, audit_date, status, score, notes)
select id, current_date - ((row_number() over ())::int * interval '7 days'), 'COMPLETED', 55 + ((row_number() over ())::int % 40), 'Seeded fictional accessibility audit.'
from public.buildings limit 20;

insert into public.issues (issue_number, building_id, title, description, category, severity, status, responsible_department, deadline, action_required)
select
  'ACC-' || (1023 + series)::text,
  (select id from public.buildings order by name offset ((series - 1) % 20) limit 1),
  case series % 5 when 0 then 'No wheelchair ramp at main entrance' when 1 then 'Accessible toilet grab bars incomplete' when 2 then 'Tactile pathway is interrupted' when 3 then 'Accessible parking bay not marked' else 'Directional signage lacks tactile information' end,
  'Fictional audit observation created for the Chennai pilot demonstration.',
  case series % 5 when 0 then 'ENTRANCE' when 1 then 'TOILETS' when 2 then 'MOVEMENT' when 3 then 'PARKING' else 'COMMUNICATION' end,
  case series % 4 when 0 then 'HIGH'::public.severity_level when 1 then 'MEDIUM'::public.severity_level when 2 then 'LOW'::public.severity_level else 'CRITICAL'::public.severity_level end,
  case when series <= 70 then 'CLOSED'::public.issue_status when series <= 100 then 'IN_PROGRESS'::public.issue_status when series <= 110 then 'OVERDUE'::public.issue_status else 'PENDING'::public.issue_status end,
  case series % 2 when 0 then 'Engineering' else 'Building Administration' end,
  current_date + case when series between 101 and 110 then -8 else 20 end,
  'Remove the barrier and provide clear before/after evidence for human verification.'
from generate_series(1,120) as series;
