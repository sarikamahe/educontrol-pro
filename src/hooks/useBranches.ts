import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Branch } from '@/types/database';
import { toast } from 'sonner';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Branch[];
    },
  });
}

export function useBranchStats() {
  return useQuery({
    queryKey: ['branch-stats'],
    queryFn: async () => {
      const { data: branches, error: branchError } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true);
      
      if (branchError) throw branchError;

      const stats = await Promise.all(
        (branches || []).map(async (branch) => {
          // Count subjects
          const { count: subjectCount } = await supabase
            .from('subjects')
            .select('*', { count: 'exact', head: true })
            .eq('branch_id', branch.id)
            .eq('is_active', true);

          // Count students
          const { count: studentCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('branch_id', branch.id)
            .eq('is_active', true);

          return {
            ...branch,
            subjectCount: subjectCount || 0,
            studentCount: studentCount || 0,
          };
        })
      );

      return stats;
    },
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (branch: { name: string; code: string; description?: string }) => {
      const { data, error } = await supabase
        .from('branches')
        .insert(branch)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch-stats'] });
      toast.success('Branch created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create branch: ' + error.message);
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...branch }: Partial<Branch> & { id: string }) => {
      const { data, error } = await supabase
        .from('branches')
        .update(branch)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch-stats'] });
      toast.success('Branch updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update branch: ' + error.message);
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch-stats'] });
      toast.success('Branch deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete branch: ' + error.message);
    },
  });
}
