-- First, delete the broken user records and their roles
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('utkarsh@transcendi.co', 'samarthjaiswal9c@gmail.com')
);

DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email IN ('utkarsh@transcendi.co', 'samarthjaiswal9c@gmail.com')
);

DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('utkarsh@transcendi.co', 'samarthjaiswal9c@gmail.com')
);

DELETE FROM auth.users WHERE email IN ('utkarsh@transcendi.co', 'samarthjaiswal9c@gmail.com');