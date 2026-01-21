-- Insert subjects using existing branch IDs
INSERT INTO public.subjects (id, name, code, description, branch_id, credits, semester, is_active)
VALUES 
  ('d1111111-aaaa-1111-aaaa-111111111111'::uuid, 'Data Structures', 'CS201', 'Introduction to data structures and algorithms', '098c0c33-5a42-4777-891a-0688937a0f07'::uuid, 4, 3, true),
  ('d2222222-bbbb-2222-bbbb-222222222222'::uuid, 'Database Management', 'CS301', 'Database design and SQL', '098c0c33-5a42-4777-891a-0688937a0f07'::uuid, 3, 5, true),
  ('d3333333-cccc-3333-cccc-333333333333'::uuid, 'Machine Learning', 'CS401', 'Introduction to ML and AI', '098c0c33-5a42-4777-891a-0688937a0f07'::uuid, 4, 7, true),
  ('d4444444-dddd-4444-dddd-444444444444'::uuid, 'Thermodynamics', 'ME201', 'Heat and energy transfer', '93599224-9257-4978-a36b-7731169d0f11'::uuid, 4, 3, true)
ON CONFLICT (id) DO NOTHING;

-- Assign teacher to subjects
INSERT INTO public.teacher_subjects (teacher_id, subject_id, academic_year, is_active)
VALUES 
  ('b1111111-1111-1111-1111-111111111111'::uuid, 'd1111111-aaaa-1111-aaaa-111111111111'::uuid, '2024-25', true),
  ('b1111111-1111-1111-1111-111111111111'::uuid, 'd2222222-bbbb-2222-bbbb-222222222222'::uuid, '2024-25', true),
  ('b1111111-1111-1111-1111-111111111111'::uuid, 'd3333333-cccc-3333-cccc-333333333333'::uuid, '2024-25', true)
ON CONFLICT DO NOTHING;

-- Update teacher profile with branch
UPDATE public.profiles 
SET branch_id = '098c0c33-5a42-4777-891a-0688937a0f07'::uuid
WHERE id = 'b1111111-1111-1111-1111-111111111111'::uuid;

-- Create trigger to update attendance summary
DROP TRIGGER IF EXISTS update_attendance_summary_trigger ON public.attendance_records;
CREATE TRIGGER update_attendance_summary_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_attendance_summary();