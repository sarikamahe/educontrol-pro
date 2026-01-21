-- Create sample student accounts
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud, confirmation_token, email_change,
  email_change_token_new, email_change_token_current, phone_change,
  phone_change_token, recovery_token, reauthentication_token
) VALUES 
(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'student1@edu.com',
  crypt('demo123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Alice Johnson"}',
  false, 'authenticated', 'authenticated',
  '', '', '', '', '', '', '', ''
),
(
  'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'student2@edu.com',
  crypt('demo123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Bob Smith"}',
  false, 'authenticated', 'authenticated',
  '', '', '', '', '', '', '', ''
),
(
  'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'student3@edu.com',
  crypt('demo123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Charlie Brown"}',
  false, 'authenticated', 'authenticated',
  '', '', '', '', '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;

-- Create identities for students
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'student1@edu.com', '{"sub": "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", "email": "student1@edu.com", "email_verified": true}', 'email', now(), now(), now()),
(gen_random_uuid(), 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'student2@edu.com', '{"sub": "a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2", "email": "student2@edu.com", "email_verified": true}', 'email', now(), now(), now()),
(gen_random_uuid(), 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid, 'student3@edu.com', '{"sub": "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", "email": "student3@edu.com", "email_verified": true}', 'email', now(), now(), now())
ON CONFLICT DO NOTHING;

-- Create profiles for students (trigger may have created them, so upsert)
INSERT INTO public.profiles (id, email, full_name, branch_id, enrollment_number, is_active)
VALUES 
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'student1@edu.com', 'Alice Johnson', '098c0c33-5a42-4777-891a-0688937a0f07'::uuid, 'CS2024001', true),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'student2@edu.com', 'Bob Smith', '098c0c33-5a42-4777-891a-0688937a0f07'::uuid, 'CS2024002', true),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid, 'student3@edu.com', 'Charlie Brown', '098c0c33-5a42-4777-891a-0688937a0f07'::uuid, 'CS2024003', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  branch_id = EXCLUDED.branch_id,
  enrollment_number = EXCLUDED.enrollment_number;

-- Enroll students in subjects
INSERT INTO public.enrollments (student_id, subject_id, academic_year, is_active)
VALUES 
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2024-25', true),
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'd2222222-bbbb-2222-bbbb-222222222222'::uuid, '2024-25', true),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2024-25', true),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'd3333333-cccc-3333-cccc-333333333333'::uuid, '2024-25', true),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2024-25', true)
ON CONFLICT DO NOTHING;

-- Add attendance records for students
INSERT INTO public.attendance_records (student_id, subject_id, date, status, marked_by)
VALUES 
  -- Alice: High attendance (86%)
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-10', 'present', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-11', 'present', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-12', 'present', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-13', 'present', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-14', 'absent', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-15', 'present', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-16', 'present', 'b1111111-1111-1111-1111-111111111111'::uuid),
  -- Bob: Medium attendance (71%)
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-10', 'present', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-11', 'absent', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-12', 'present', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-13', 'absent', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-14', 'present', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-15', 'absent', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-16', 'late', 'b1111111-1111-1111-1111-111111111111'::uuid),
  -- Charlie: Low attendance (60%)
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-10', 'present', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-11', 'absent', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-12', 'absent', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-13', 'present', 'b1111111-1111-1111-1111-111111111111'::uuid),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2026-01-14', 'absent', 'b1111111-1111-1111-1111-111111111111'::uuid)
ON CONFLICT DO NOTHING;