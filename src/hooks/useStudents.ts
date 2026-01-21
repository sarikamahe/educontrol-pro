import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudentWithAttendance {
  id: string;
  email: string;
  full_name: string | null;
  enrollment_number: string | null;
  avatar_url: string | null;
  branch_id: string | null;
  is_active: boolean;
  attendance_summary: {
    attendance_percentage: number;
    access_status: string;
    total_classes: number;
    classes_attended: number;
    subject_id: string;
    subjects?: { name: string; code: string };
  }[];
  branch?: {
    name: string;
    code: string;
  };
  overallAttendance: number;
  accessStatus: string;
}

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      // Get all profiles that have student role
      const { data: studentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');
      
      if (rolesError) throw rolesError;
      
      const studentIds = studentRoles?.map(r => r.user_id) || [];
      
      if (studentIds.length === 0) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches:branch_id (name, code)
        `)
        .in('id', studentIds);
      
      if (error) throw error;

      // Get attendance summary for each student
      const studentsWithAttendance = await Promise.all(
        (data || []).map(async (student) => {
          const { data: summaries } = await supabase
            .from('attendance_summary')
            .select(`
              *,
              subjects:subject_id (id, name, code)
            `)
            .eq('student_id', student.id);
          
          // Calculate overall attendance
          const totalClasses = summaries?.reduce((sum, s) => sum + (s.total_classes || 0), 0) || 0;
          const classesAttended = summaries?.reduce((sum, s) => sum + (s.classes_attended || 0), 0) || 0;
          const overallPercentage = totalClasses > 0 ? (classesAttended / totalClasses) * 100 : 100;
          
          let accessStatus = 'allowed';
          if (overallPercentage < 65) accessStatus = 'blocked';
          else if (overallPercentage < 75) accessStatus = 'at_risk';

          return {
            ...student,
            branch: student.branches,
            attendance_summary: summaries || [],
            overallAttendance: Math.round(overallPercentage * 100) / 100,
            accessStatus,
          };
        })
      );

      return studentsWithAttendance;
    },
  });
}

export function useEnrollStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ studentId, subjectId, academicYear }: {
      studentId: string;
      subjectId: string;
      academicYear?: string;
    }) => {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          student_id: studentId,
          subject_id: subjectId,
          academic_year: academicYear || '2024-25',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Student enrolled successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to enroll student: ' + error.message);
    },
  });
}

export function useGrantOverride() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ studentId, subjectId, reason, grantedBy, expiresAt }: {
      studentId: string;
      subjectId?: string;
      reason: string;
      grantedBy: string;
      expiresAt?: string;
    }) => {
      const { data, error } = await supabase
        .from('access_overrides')
        .insert({
          student_id: studentId,
          subject_id: subjectId || null,
          reason,
          granted_by: grantedBy,
          override_type: 'grant',
          expires_at: expiresAt || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Access override granted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to grant override: ' + error.message);
    },
  });
}
