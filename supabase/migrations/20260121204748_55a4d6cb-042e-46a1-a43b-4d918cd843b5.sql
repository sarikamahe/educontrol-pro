-- Fix: Convert RESTRICTIVE policies to PERMISSIVE for resources and assignments
-- Currently all policies are RESTRICTIVE which requires ALL to pass
-- We need PERMISSIVE so that ANY matching policy grants access

-- ========== RESOURCES TABLE ==========
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Students can view resources if eligible" ON public.resources;
DROP POLICY IF EXISTS "Super admins can manage all resources" ON public.resources;
DROP POLICY IF EXISTS "Teachers can manage resources in their subjects or branch" ON public.resources;

-- Recreate as PERMISSIVE (default) policies
CREATE POLICY "Students can view resources if eligible"
ON public.resources
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'student'::app_role) 
  AND EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.student_id = auth.uid() 
    AND enrollments.subject_id = resources.subject_id
    AND enrollments.is_active = true
  )
  AND (
    is_attendance_required = false 
    OR student_has_access(auth.uid(), subject_id)
  )
);

CREATE POLICY "Super admins can manage all resources"
ON public.resources
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Teachers can manage resources in their subjects or branch"
ON public.resources
FOR ALL
TO authenticated
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

-- ========== ASSIGNMENTS TABLE ==========
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Students can view assignments if eligible" ON public.assignments;
DROP POLICY IF EXISTS "Super admins can manage all assignments" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can manage assignments in their subjects or branch" ON public.assignments;

-- Recreate as PERMISSIVE (default) policies
CREATE POLICY "Students can view assignments if eligible"
ON public.assignments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'student'::app_role) 
  AND EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.student_id = auth.uid() 
    AND enrollments.subject_id = assignments.subject_id
    AND enrollments.is_active = true
  )
  AND (
    is_attendance_required = false 
    OR student_has_access(auth.uid(), subject_id)
  )
);

CREATE POLICY "Super admins can manage all assignments"
ON public.assignments
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Teachers can manage assignments in their subjects or branch"
ON public.assignments
FOR ALL
TO authenticated
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