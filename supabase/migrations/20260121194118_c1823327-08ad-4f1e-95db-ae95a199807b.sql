-- Add unique constraint for attendance records upsert
ALTER TABLE public.attendance_records 
ADD CONSTRAINT attendance_records_student_subject_date_unique 
UNIQUE (student_id, subject_id, date);

-- Create trigger for auto-updating attendance summary
DROP TRIGGER IF EXISTS trigger_update_attendance_summary ON public.attendance_records;
CREATE TRIGGER trigger_update_attendance_summary
  AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_attendance_summary();