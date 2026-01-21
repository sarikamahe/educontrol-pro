-- Create teacher account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'utkarsh@transcendi.co',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Utkarsh (Teacher)"}',
  false,
  'authenticated',
  'authenticated',
  ''
);

-- Create super admin account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'samarthjaiswal9c@gmail.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Samarth Jaiswal (Super Admin)"}',
  false,
  'authenticated',
  'authenticated',
  ''
);

-- Assign teacher role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'teacher'::app_role FROM auth.users WHERE email = 'utkarsh@transcendi.co';

-- Assign super_admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role FROM auth.users WHERE email = 'samarthjaiswal9c@gmail.com';