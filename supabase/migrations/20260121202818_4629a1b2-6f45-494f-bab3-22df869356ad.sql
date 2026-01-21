
-- Fix 1: Teachers can view students in their same branch (not just enrolled in their subjects)
DROP POLICY IF EXISTS "Teachers can view students in their subjects" ON public.profiles;

CREATE POLICY "Teachers can view students in their branch" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND has_role(profiles.id, 'student'::app_role)
  AND profiles.branch_id = get_user_branch(auth.uid())
);

-- Fix 2: Super admins can manage all resources (not just SELECT)
DROP POLICY IF EXISTS "Super admins can view all resources" ON public.resources;

CREATE POLICY "Super admins can manage all resources" 
ON public.resources 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Fix 3: Super admins can manage all assignments (not just SELECT)
DROP POLICY IF EXISTS "Super admins can view all assignments" ON public.assignments;

CREATE POLICY "Super admins can manage all assignments" 
ON public.assignments 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Fix 4: Teachers can manage resources in their branch (if not assigned to specific subject)
DROP POLICY IF EXISTS "Teachers can manage resources" ON public.resources;

CREATE POLICY "Teachers can manage resources in their subjects or branch" 
ON public.resources 
FOR ALL 
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND (
    is_teacher_of_subject(auth.uid(), subject_id)
    OR EXISTS (
      SELECT 1 FROM subjects s 
      WHERE s.id = resources.subject_id 
      AND s.branch_id = get_user_branch(auth.uid())
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND (
    is_teacher_of_subject(auth.uid(), subject_id)
    OR EXISTS (
      SELECT 1 FROM subjects s 
      WHERE s.id = resources.subject_id 
      AND s.branch_id = get_user_branch(auth.uid())
    )
  )
);

-- Fix 5: Teachers can manage assignments in their branch (if not assigned to specific subject)
DROP POLICY IF EXISTS "Teachers can manage assignments" ON public.assignments;

CREATE POLICY "Teachers can manage assignments in their subjects or branch" 
ON public.assignments 
FOR ALL 
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND (
    is_teacher_of_subject(auth.uid(), subject_id)
    OR EXISTS (
      SELECT 1 FROM subjects s 
      WHERE s.id = assignments.subject_id 
      AND s.branch_id = get_user_branch(auth.uid())
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND (
    is_teacher_of_subject(auth.uid(), subject_id)
    OR EXISTS (
      SELECT 1 FROM subjects s 
      WHERE s.id = assignments.subject_id 
      AND s.branch_id = get_user_branch(auth.uid())
    )
  )
);
