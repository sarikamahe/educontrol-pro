-- Create junction table for subject-branch many-to-many relationship
CREATE TABLE public.subject_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subject_id, branch_id)
);

-- Enable RLS
ALTER TABLE public.subject_branches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subject_branches
CREATE POLICY "Subject branches viewable by authenticated users"
ON public.subject_branches
FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage all subject branches"
ON public.subject_branches
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Teachers can manage subject branches in their branch"
ON public.subject_branches
FOR ALL
USING (has_role(auth.uid(), 'teacher'::app_role) AND branch_id = get_user_branch(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) AND branch_id = get_user_branch(auth.uid()));

-- Migrate existing data from subjects.branch_id to junction table
INSERT INTO public.subject_branches (subject_id, branch_id)
SELECT id, branch_id FROM public.subjects WHERE branch_id IS NOT NULL;

-- Create helper function to check if subject belongs to a branch
CREATE OR REPLACE FUNCTION public.subject_has_branch(_subject_id uuid, _branch_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subject_branches
    WHERE subject_id = _subject_id 
    AND branch_id = _branch_id 
    AND is_active = true
  )
$$;