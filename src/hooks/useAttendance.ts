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
      // Use upsert with conflict on student_id + subject_id + date
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert(records, {
          onConflict: 'student_id,subject_id,date',
          ignoreDuplicates: false,
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Attendance saved successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to save attendance: ' + error.message);
    },
  });
}

export function useEnrolledStudents(subjectId?: string) {
  return useQuery({
    queryKey: ['enrolled-students', subjectId],
    enabled: !!subjectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles:student_id (
            id, full_name, email, enrollment_number, avatar_url
          ),
          attendance_summary (
            attendance_percentage,
            access_status,
            total_classes,
            classes_attended
          )
        `)
        .eq('subject_id', subjectId!)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
  });
}
