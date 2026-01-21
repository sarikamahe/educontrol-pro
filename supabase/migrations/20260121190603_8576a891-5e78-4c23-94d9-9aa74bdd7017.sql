-- Step 2: Create identities for login
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES 
(
  gen_random_uuid(),
  'b1111111-1111-1111-1111-111111111111'::uuid,
  'utkarsh@transcendi.co',
  '{"sub": "b1111111-1111-1111-1111-111111111111", "email": "utkarsh@transcendi.co", "email_verified": true, "provider": "email"}',
  'email',
  now(), now(), now()
),
(
  gen_random_uuid(),
  'b2222222-2222-2222-2222-222222222222'::uuid,
  'samarthjaiswal9c@gmail.com',
  '{"sub": "b2222222-2222-2222-2222-222222222222", "email": "samarthjaiswal9c@gmail.com", "email_verified": true, "provider": "email"}',
  'email',
  now(), now(), now()
);

-- Step 3: Create profiles (or update if trigger created them)
INSERT INTO public.profiles (id, email, full_name, is_active, created_at, updated_at)
VALUES 
  ('b1111111-1111-1111-1111-111111111111'::uuid, 'utkarsh@transcendi.co', 'Utkarsh (Teacher)', true, now(), now()),
  ('b2222222-2222-2222-2222-222222222222'::uuid, 'samarthjaiswal9c@gmail.com', 'Samarth Jaiswal (Super Admin)', true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;

-- Step 4: Assign roles
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('b1111111-1111-1111-1111-111111111111'::uuid, 'teacher'),
  ('b2222222-2222-2222-2222-222222222222'::uuid, 'super_admin');