-- Drop existing teacher policy for access_overrides
DROP POLICY IF EXISTS "Teachers can manage overrides in their subjects" ON access_overrides;

-- Create updated policy that allows teachers to manage overrides for:
-- 1. Subjects they teach (subject_id is not null and they teach it)
-- 2. Global overrides (subject_id is null) for students in their branch
CREATE POLICY "Teachers can manage overrides in their subjects or branch"
ON access_overrides
FOR ALL
USING (
  has_role(auth.uid(), 'teacher'::app_role) AND (
    -- Can manage subject-specific overrides if they teach the subject
    (subject_id IS NOT NULL AND is_teacher_of_subject(auth.uid(), subject_id))
    OR
    -- Can manage global overrides for students in their branch
    (subject_id IS NULL AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = access_overrides.student_id 
      AND p.branch_id = get_user_branch(auth.uid())
    ))
  )
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) AND (
    (subject_id IS NOT NULL AND is_teacher_of_subject(auth.uid(), subject_id))
    OR
    (subject_id IS NULL AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = access_overrides.student_id 
      AND p.branch_id = get_user_branch(auth.uid())
    ))
  )
);