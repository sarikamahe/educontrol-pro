import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AppRole } from '@/types/database';

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  branch_id: string | null;
  enrollment_number: string | null;
  is_active: boolean;
  roles: AppRole[];
  branch?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          branches:branch_id (id, name, code)
        `)
        .order('full_name');
      
      if (profilesError) throw profilesError;

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);
          
          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            branch_id: profile.branch_id,
            enrollment_number: profile.enrollment_number,
            is_active: profile.is_active,
            branch: profile.branches,
            roles: roles?.map(r => r.role as AppRole) || ['student' as AppRole],
          } as UserWithRole;
        })
      );

      return usersWithRoles;
    },
  });
}
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // First delete existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update user role: ' + error.message);
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update user status: ' + error.message);
    },
  });
}

export function useAssignTeacherSubject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ teacherId, subjectId, academicYear }: {
      teacherId: string;
      subjectId: string;
      academicYear?: string;
    }) => {
      const { data, error } = await supabase
        .from('teacher_subjects')
        .insert({
          teacher_id: teacherId,
          subject_id: subjectId,
          academic_year: academicYear || '2024-25',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-subjects'] });
      toast.success('Teacher assigned to subject successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to assign teacher: ' + error.message);
    },
  });
}
