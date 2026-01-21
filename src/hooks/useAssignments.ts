import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAssignments(subjectId?: string) {
  return useQuery({
    queryKey: ['assignments', subjectId],
    queryFn: async () => {
      let query = supabase
        .from('assignments')
        .select(`
          *,
          subjects:subject_id (id, name, code)
        `)
        .eq('is_active', true)
        .order('due_date', { ascending: true });
      
      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
}

export function useStudentAssignments(studentId?: string) {
  return useQuery({
    queryKey: ['student-assignments', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      // Get student's enrolled subjects
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('subject_id')
        .eq('student_id', studentId!)
        .eq('is_active', true);
      
      if (enrollError) throw enrollError;
      
      const subjectIds = enrollments?.map(e => e.subject_id) || [];
      
      if (subjectIds.length === 0) return [];

      // Get assignments for those subjects
      const { data: assignments, error: assignError } = await supabase
        .from('assignments')
        .select(`
          *,
          subjects:subject_id (id, name, code)
        `)
        .in('subject_id', subjectIds)
        .eq('is_active', true)
        .order('due_date', { ascending: true });
      
      if (assignError) throw assignError;

      // Get student's submissions
      const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', studentId!);
      
      if (subError) throw subError;

      // Check student access for each assignment
      const assignmentsWithStatus = await Promise.all(
        (assignments || []).map(async (assignment) => {
          const submission = submissions?.find(s => s.assignment_id === assignment.id);
          
          // Check if student has access
          const { data: hasAccess } = await supabase.rpc('student_has_access', {
            _student_id: studentId!,
            _subject_id: assignment.subject_id,
          });

          return {
            ...assignment,
            submission,
            hasAccess: hasAccess || !assignment.is_attendance_required,
            status: submission?.status || 'pending',
          };
        })
      );

      return assignmentsWithStatus;
    },
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      title,
      description,
      subjectId,
      dueDate,
      maxScore,
      createdBy,
      isAttendanceRequired,
      file,
    }: {
      title: string;
      description?: string;
      subjectId: string;
      dueDate: string;
      maxScore?: number;
      createdBy: string;
      isAttendanceRequired?: boolean;
      file?: File;
    }) => {
      let attachmentUrl = null;

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `assignments/${subjectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('resources')
          .getPublicUrl(fileName);
        
        attachmentUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('assignments')
        .insert({
          title,
          description,
          subject_id: subjectId,
          due_date: dueDate,
          max_score: maxScore ?? 100,
          created_by: createdBy,
          is_attendance_required: isAttendanceRequired ?? true,
          attachment_url: attachmentUrl,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create assignment: ' + error.message);
    },
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      assignmentId,
      studentId,
      file,
      notes,
    }: {
      assignmentId: string;
      studentId: string;
      file?: File;
      notes?: string;
    }) => {
      let fileUrl = null;
      let fileName = null;

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const path = `${studentId}/${assignmentId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('assignments')
          .upload(path, file);
        
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('assignments')
          .getPublicUrl(path);
        
        fileUrl = urlData.publicUrl;
        fileName = file.name;
      }

      const { data, error } = await supabase
        .from('submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: studentId,
          file_url: fileUrl,
          file_name: fileName,
          notes,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        }, {
          onConflict: 'assignment_id,student_id',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Assignment submitted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to submit assignment: ' + error.message);
    },
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      submissionId,
      score,
      feedback,
      gradedBy,
    }: {
      submissionId: string;
      score: number;
      feedback?: string;
      gradedBy: string;
    }) => {
      const { data, error } = await supabase
        .from('submissions')
        .update({
          score,
          feedback,
          status: 'graded',
          graded_at: new Date().toISOString(),
          graded_by: gradedBy,
        })
        .eq('id', submissionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Submission graded successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to grade submission: ' + error.message);
    },
  });
}
