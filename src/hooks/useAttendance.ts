import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAttendanceRecords(subjectId?: string, date?: string) {
  return useQuery({
    queryKey: ['attendance-records', subjectId, date],
    enabled: !!subjectId && !!date,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          profiles:student_id (
            id, full_name, email, enrollment_number, avatar_url
          )
        `)
        .eq('subject_id', subjectId!)
        .eq('date', date!);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useStudentAttendance(studentId?: string) {
  return useQuery({
    queryKey: ['student-attendance', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data: summary, error: summaryError } = await supabase
        .from('attendance_summary')
        .select(`
          *,
          subjects:subject_id (id, name, code)
        `)
        .eq('student_id', studentId!);
      
      if (summaryError) throw summaryError;

      const { data: records, error: recordsError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          subjects:subject_id (id, name, code)
        `)
        .eq('student_id', studentId!)
        .order('date', { ascending: false })
        .limit(20);
      
      if (recordsError) throw recordsError;

      return { summary, records };
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (records: {
      student_id: string;
      subject_id: string;
      date: string;
      status: 'present' | 'absent' | 'late' | 'excused';
      marked_by: string;
      notes?: string;
    }[]) => {
      // Use INSERT instead of UPSERT to enforce once-only marking
      // The unique constraint will prevent duplicates
      const { data, error } = await supabase
        .from('attendance_records')
        .insert(records)
        .select();
      
      if (error) {
        // Check if it's a duplicate key error
        if (error.code === '23505') {
          throw new Error('Attendance for this date has already been marked and cannot be modified.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
      toast.success('Attendance saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useEnrolledStudents(subjectId?: string) {
  return useQuery({
    queryKey: ['enrolled-students', subjectId],
    enabled: !!subjectId,
    queryFn: async () => {
      // First, get the subject's branch
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('branch_id')
        .eq('id', subjectId!)
        .single();
      
      if (subjectError) throw subjectError;

      // Check for explicit enrollments first
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles:student_id (
            id, full_name, email, enrollment_number, avatar_url
          )
        `)
        .eq('subject_id', subjectId!)
        .eq('is_active', true);
      
      if (enrollError) throw enrollError;

      // If no explicit enrollments, get all students from the subject's branch
      let studentsList: any[] = [];
      
      if (enrollments && enrollments.length > 0) {
        studentsList = enrollments;
      } else if (subject?.branch_id) {
        // Get all active students in the branch
        const { data: branchStudents, error: branchError } = await supabase
          .from('profiles')
          .select('id, full_name, email, enrollment_number, avatar_url')
          .eq('branch_id', subject.branch_id)
          .eq('is_active', true);
        
        if (branchError) throw branchError;

        // Filter to only students (check user_roles)
        const { data: studentRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'student');
        
        const studentIds = new Set(studentRoles?.map(r => r.user_id) || []);
        
        studentsList = (branchStudents || [])
          .filter(p => studentIds.has(p.id))
          .map(profile => ({
            id: `branch-${profile.id}`,
            student_id: profile.id,
            subject_id: subjectId,
            is_active: true,
            profiles: profile,
          }));
      }

      // Fetch attendance summaries for all students
      const enrichedEnrollments = await Promise.all(
        studentsList.map(async (enrollment) => {
          const { data: summary } = await supabase
            .from('attendance_summary')
            .select('*')
            .eq('student_id', enrollment.student_id)
            .eq('subject_id', subjectId!)
            .maybeSingle();
          
          return {
            ...enrollment,
            attendance_summary: summary,
          };
        })
      );
      
      return enrichedEnrollments;
    },
  });
}
