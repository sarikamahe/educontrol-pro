-- Fix attendance_records policies to use subject_branches junction table
DROP POLICY IF EXISTS "Teachers can manage attendance in their branch subjects" ON attendance_records;
DROP POLICY IF EXISTS "Teachers can manage attendance in their subjects" ON attendance_records;

-- Create single unified policy for teachers managing attendance
CREATE POLICY "Teachers can manage attendance in their subjects or branch"
ON attendance_records
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

-- Also fix attendance_summary SELECT policy for teachers
DROP POLICY IF EXISTS "Teachers can view summary for their subjects" ON attendance_summary;

CREATE POLICY "Teachers can view summary for their subjects or branch"
ON attendance_summary
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND (
    is_teacher_of_subject(auth.uid(), subject_id) 
    OR 
    subject_has_branch(subject_id, get_user_branch(auth.uid()))
  )
);

-- Fix subjects policy for teachers
DROP POLICY IF EXISTS "Teachers can manage subjects in their branch" ON subjects;

CREATE POLICY "Teachers can manage subjects in their branch"
ON subjects
FOR ALL
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND subject_has_branch(id, get_user_branch(auth.uid()))
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND subject_has_branch(id, get_user_branch(auth.uid()))
);