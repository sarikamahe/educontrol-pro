-- Add policy to allow teachers and super admins to view student roles
-- This is needed so teachers can identify which profiles are students

CREATE POLICY "Teachers can view student roles in their branch"
ON public.user_roles
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND role = 'student'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id
    AND p.branch_id = get_user_branch(auth.uid())
  )
);

CREATE POLICY "Super admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));