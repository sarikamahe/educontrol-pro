-- Drop existing student policy for resources
DROP POLICY IF EXISTS "Students can view resources if eligible" ON resources;

-- Create updated policy that allows students to view resources if:
-- 1. They have an enrollment in the subject, OR
-- 2. Their branch is linked to the subject via subject_branches
-- AND they meet attendance requirements or have an override
CREATE POLICY "Students can view resources if eligible"
ON resources
FOR SELECT
USING (
  has_role(auth.uid(), 'student'::app_role) 
  AND (
    -- Check enrollment OR branch membership
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.student_id = auth.uid() 
      AND enrollments.subject_id = resources.subject_id 
      AND enrollments.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM subject_branches sb
      JOIN profiles p ON p.branch_id = sb.branch_id
      WHERE sb.subject_id = resources.subject_id
      AND sb.is_active = true
      AND p.id = auth.uid()
    )
  )
  AND (
    -- Check attendance requirement
    is_attendance_required = false 
    OR student_has_access(auth.uid(), subject_id)
  )
);

-- Also update assignments policy similarly
DROP POLICY IF EXISTS "Students can view assignments if eligible" ON assignments;

CREATE POLICY "Students can view assignments if eligible"
ON assignments
FOR SELECT
USING (
  has_role(auth.uid(), 'student'::app_role) 
  AND (
    -- Check enrollment OR branch membership
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.student_id = auth.uid() 
      AND enrollments.subject_id = assignments.subject_id 
      AND enrollments.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM subject_branches sb
      JOIN profiles p ON p.branch_id = sb.branch_id
      WHERE sb.subject_id = assignments.subject_id
      AND sb.is_active = true
      AND p.id = auth.uid()
    )
  )
  AND (
    -- Check attendance requirement
    is_attendance_required = false 
    OR student_has_access(auth.uid(), subject_id)
  )
);