-- Remove the extra student roles that were auto-added by trigger
DELETE FROM public.user_roles 
WHERE role = 'student' 
AND user_id IN (
  SELECT id FROM auth.users WHERE email IN ('utkarsh@transcendi.co', 'samarthjaiswal9c@gmail.com')
);