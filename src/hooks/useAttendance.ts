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
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles:student_id (
            id, full_name, email, enrollment_number, avatar_url
          )
        `)
        .eq('subject_id', subjectId!)
        .eq('is_active', true);
      
      if (error) throw error;

      // Fetch attendance summaries separately
      const enrichedEnrollments = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
          const { data: summary } = await supabase
            .from('attendance_summary')
            .select('*')
            .eq('student_id', enrollment.student_id)
            .eq('subject_id', subjectId!)
            .single();
          
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
