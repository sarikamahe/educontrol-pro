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
            id, email, full_name, enrollment_number, avatar_url
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
          .select('id, email, full_name, enrollment_number, avatar_url')
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
            .select('attendance_percentage, access_status, total_classes, classes_attended')
            .eq('student_id', enrollment.student_id)
            .eq('subject_id', subjectId!)
            .maybeSingle();
          
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

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Delete related records first to avoid foreign key constraints
      // Order matters: delete dependent tables before the subject
      
      // Delete attendance summary
      await supabase.from('attendance_summary').delete().eq('subject_id', id);
      
      // Delete attendance records
      await supabase.from('attendance_records').delete().eq('subject_id', id);
      
      // Delete enrollments
      await supabase.from('enrollments').delete().eq('subject_id', id);
      
      // Delete teacher-subject assignments
      await supabase.from('teacher_subjects').delete().eq('subject_id', id);
      
      // Delete resources
      await supabase.from('resources').delete().eq('subject_id', id);
      
      // Get assignments for this subject to delete their submissions
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id')
        .eq('subject_id', id);
      
      if (assignments && assignments.length > 0) {
        const assignmentIds = assignments.map(a => a.id);
        await supabase.from('submissions').delete().in('assignment_id', assignmentIds);
      }
      
      // Delete assignments
      await supabase.from('assignments').delete().eq('subject_id', id);
      
      // Delete access overrides for this subject
      await supabase.from('access_overrides').delete().eq('subject_id', id);
      
      // Finally, delete the subject
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete subject: ' + error.message);
    },
  });
}
