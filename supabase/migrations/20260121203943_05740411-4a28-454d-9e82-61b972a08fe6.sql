-- Fix: Add INSERT/UPDATE/DELETE policies for super admins on attendance_records
-- Currently super admins can only SELECT, not INSERT

-- Drop the existing SELECT-only policy for super admins
DROP POLICY IF EXISTS "Super admins can view all attendance" ON public.attendance_records;

-- Create a full management policy for super admins
CREATE POLICY "Super admins can manage all attendance"
ON public.attendance_records
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Also add policy to allow teachers to manage attendance for subjects in their branch
-- This is a fallback if they're not specifically assigned to the subject
CREATE POLICY "Teachers can manage attendance in their branch subjects"
ON public.attendance_records
FOR ALL
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND EXISTS (
    SELECT 1 FROM subjects s 
    WHERE s.id = attendance_records.subject_id 
    AND s.branch_id = get_user_branch(auth.uid())
  )
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND EXISTS (
    SELECT 1 FROM subjects s 
    WHERE s.id = attendance_records.subject_id 
    AND s.branch_id = get_user_branch(auth.uid())
  )
);