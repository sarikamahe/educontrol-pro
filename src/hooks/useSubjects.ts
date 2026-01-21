import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Subject } from '@/types/database';
import { toast } from 'sonner';

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          branches:branch_id (name, code)
        `)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useTeacherSubjects(teacherId?: string) {
  return useQuery({
    queryKey: ['teacher-subjects', teacherId],
    enabled: !!teacherId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_subjects')
        .select(`
          *,
          subjects:subject_id (
            *,
            branches:branch_id (name, code)
          )
        `)
        .eq('teacher_id', teacherId!)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useSubjectStudents(subjectId?: string) {
  return useQuery({
    queryKey: ['subject-students', subjectId],
    enabled: !!subjectId,
    queryFn: async () => {
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles:student_id (
            id, email, full_name, enrollment_number, avatar_url
          )
        `)
        .eq('subject_id', subjectId!)
        .eq('is_active', true);
      
      if (error) throw error;

      // Fetch attendance summaries separately to avoid inner join exclusion
      const enrichedEnrollments = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
          const { data: summary } = await supabase
            .from('attendance_summary')
            .select('attendance_percentage, access_status, total_classes, classes_attended')
            .eq('student_id', enrollment.student_id)
            .eq('subject_id', subjectId!)
            .single();
          
          return {
            ...enrollment,
            attendance_summary: summary || {
              attendance_percentage: 0,
              access_status: 'allowed',
              total_classes: 0,
              classes_attended: 0,
            },
          };
        })
      );
      
      return enrichedEnrollments;
    },
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subject: {
      name: string;
      code: string;
      description?: string;
      branch_id: string;
      credits?: number;
      semester?: number;
    }) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert(subject)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create subject: ' + error.message);
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...subject }: Partial<Subject> & { id: string }) => {
      const { data, error } = await supabase
        .from('subjects')
        .update(subject)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update subject: ' + error.message);
    },
  });
}
