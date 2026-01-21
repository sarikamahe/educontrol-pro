-- Create storage buckets for resources and assignments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('resources', 'resources', true, 52428800, ARRAY['application/pdf', 'video/mp4', 'video/webm', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']),
  ('assignments', 'assignments', false, 52428800, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resources bucket
CREATE POLICY "Resources are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

CREATE POLICY "Teachers can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' 
  AND (
    has_role(auth.uid(), 'super_admin'::app_role) 
    OR has_role(auth.uid(), 'teacher'::app_role)
  )
);

CREATE POLICY "Teachers can update resources"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resources' 
  AND (
    has_role(auth.uid(), 'super_admin'::app_role) 
    OR has_role(auth.uid(), 'teacher'::app_role)
  )
);

CREATE POLICY "Teachers can delete resources"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resources' 
  AND (
    has_role(auth.uid(), 'super_admin'::app_role) 
    OR has_role(auth.uid(), 'teacher'::app_role)
  )
);

-- Storage policies for assignments bucket
CREATE POLICY "Users can view their own assignment submissions"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assignments' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'teacher'::app_role)
  )
);

CREATE POLICY "Students can upload their submissions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assignments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Students can update their submissions"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'assignments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Teachers can manage all assignment files"
ON storage.objects FOR ALL
USING (
  bucket_id = 'assignments' 
  AND (
    has_role(auth.uid(), 'super_admin'::app_role) 
    OR has_role(auth.uid(), 'teacher'::app_role)
  )
);