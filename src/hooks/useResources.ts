import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Resource } from '@/types/database';
import { toast } from 'sonner';

export function useResources(subjectId?: string) {
  return useQuery({
    queryKey: ['resources', subjectId],
    queryFn: async () => {
      let query = supabase
        .from('resources')
        .select(`
          *,
          subjects:subject_id (id, name, code)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUploadResource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      subjectId,
      resourceType,
      uploadedBy,
      isAttendanceRequired,
    }: {
      file: File;
      title: string;
      description?: string;
      subjectId: string;
      resourceType: 'recording' | 'notes' | 'guidance' | 'other';
      uploadedBy: string;
      isAttendanceRequired?: boolean;
    }) => {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${subjectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      // Create resource record
      const { data, error } = await supabase
        .from('resources')
        .insert({
          title,
          description,
          subject_id: subjectId,
          resource_type: resourceType,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          uploaded_by: uploadedBy,
          is_attendance_required: isAttendanceRequired ?? true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to upload resource: ' + error.message);
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('resources')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete resource: ' + error.message);
    },
  });
}
