-- Drop existing teacher policies for resources and assignments
DROP POLICY IF EXISTS "Teachers can manage resources in their subjects or branch" ON resources;
DROP POLICY IF EXISTS "Teachers can manage assignments in their subjects or branch" ON assignments;

-- Create updated policy for resources that uses subject_branches junction table
CREATE POLICY "Teachers can manage resources in their subjects or branch"
ON resources
FOR ALL
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND (
    -- Teacher is assigned to teach this subject
    is_teacher_of_subject(auth.uid(), subject_id) 
    OR 
    -- Subject is linked to teacher's branch via subject_branches
    subject_has_branch(subject_id, get_user_branch(auth.uid()))
  )
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND (
    is_teacher_of_subject(auth.uid(), subject_id) 
    OR 
    subject_has_branch(subject_id, get_user_branch(auth.uid()))
  )
);

-- Create updated policy for assignments that uses subject_branches junction table
CREATE POLICY "Teachers can manage assignments in their subjects or branch"
ON assignments
FOR ALL
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND (
    -- Teacher is assigned to teach this subject
    is_teacher_of_subject(auth.uid(), subject_id) 
    OR 
    -- Subject is linked to teacher's branch via subject_branches
    subject_has_branch(subject_id, get_user_branch(auth.uid()))
  )
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND (
    is_teacher_of_subject(auth.uid(), subject_id) 
    OR 
    subject_has_branch(subject_id, get_user_branch(auth.uid()))
  )
);