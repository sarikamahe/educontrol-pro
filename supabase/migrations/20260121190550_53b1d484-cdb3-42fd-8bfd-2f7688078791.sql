-- Step 1: Create users in auth.users
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud, confirmation_token, email_change,
  email_change_token_new, email_change_token_current, phone_change,
  phone_change_token, recovery_token, reauthentication_token
) VALUES 
(
  'b1111111-1111-1111-1111-111111111111'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'utkarsh@transcendi.co',
  crypt('demo123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Utkarsh (Teacher)"}',
  false, 'authenticated', 'authenticated',
  '', '', '', '', '', '', '', ''
),
(
  'b2222222-2222-2222-2222-222222222222'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'samarthjaiswal9c@gmail.com',
  crypt('demo123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Samarth Jaiswal (Super Admin)"}',
  false, 'authenticated', 'authenticated',
  '', '', '', '', '', '', '', ''
);