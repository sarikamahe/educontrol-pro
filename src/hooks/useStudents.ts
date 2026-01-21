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
  hasActiveOverride?: boolean;
}

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      // Get profiles directly - RLS will filter based on user role
      // Super admins see all, teachers see students in their branch
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches:branch_id (name, code)
        `)
        .eq('is_active', true);
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];

      // Filter to only student profiles by checking user_roles
      // Teachers may not be able to read user_roles for all users, so we query attendance_summary
      // which only exists for students
      const studentsWithAttendance = await Promise.all(
        (data || []).map(async (profile) => {
          // Check if this profile has attendance summaries (indicating they're a student)
          const { data: summaries, error: summaryError } = await supabase
            .from('attendance_summary')
            .select(`
              *,
              subjects:subject_id (id, name, code)
            `)
            .eq('student_id', profile.id);
          
          // If we can't access summaries or there's an error, they might not be a student we can see
          if (summaryError) return null;
          
          // Check for active global access override
          const { data: overrides } = await supabase
            .from('access_overrides')
            .select('*')
            .eq('student_id', profile.id)
            .eq('is_active', true)
            .is('subject_id', null) // Global override
            .eq('override_type', 'grant');
          
          const hasActiveOverride = overrides && overrides.length > 0 && 
            overrides.some(o => !o.expires_at || new Date(o.expires_at) > new Date());
          
          // Calculate overall attendance
          const totalClasses = summaries?.reduce((sum, s) => sum + (s.total_classes || 0), 0) || 0;
          const classesAttended = summaries?.reduce((sum, s) => sum + (s.classes_attended || 0), 0) || 0;
          const overallPercentage = totalClasses > 0 ? (classesAttended / totalClasses) * 100 : 100;
          
          // Determine access status - override takes precedence
          let accessStatus = 'allowed';
          if (hasActiveOverride) {
            accessStatus = 'allowed'; // Override grants access regardless of attendance
          } else if (overallPercentage < 65) {
            accessStatus = 'blocked';
          } else if (overallPercentage < 75) {
            accessStatus = 'at_risk';
          }

          return {
            ...profile,
            branch: profile.branches,
            attendance_summary: summaries || [],
            overallAttendance: Math.round(overallPercentage * 100) / 100,
            accessStatus,
            hasActiveOverride,
          };
        })
      );

      // Filter out nulls (non-students or profiles we can't access)
      return studentsWithAttendance.filter((s) => s !== null) as StudentWithAttendance[];
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
