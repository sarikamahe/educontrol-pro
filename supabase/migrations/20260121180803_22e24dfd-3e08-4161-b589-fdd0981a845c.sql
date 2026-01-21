-- =============================================
-- EDUCONTROL PRO DATABASE SCHEMA
-- =============================================

-- 1. Create Role Enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'teacher', 'student');

-- 2. Create Branches Table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  branch_id UUID REFERENCES public.branches(id),
  enrollment_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create User Roles Table (Security Best Practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 5. Create Subjects Table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 3,
  semester INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create Teacher-Subject Assignments
CREATE TABLE public.teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_year TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, subject_id, academic_year)
);

-- 7. Create Student Enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_year TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id, academic_year)
);

-- 8. Create Attendance Records Table
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id, date)
);

-- 9. Create Attendance Summary Table (Computed View)
CREATE TABLE public.attendance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  total_classes INTEGER DEFAULT 0,
  classes_attended INTEGER DEFAULT 0,
  attendance_percentage DECIMAL(5,2) DEFAULT 0,
  access_status TEXT DEFAULT 'allowed' CHECK (access_status IN ('allowed', 'at_risk', 'blocked')),
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

-- 10. Create Access Overrides Table (Teacher Manual Override)
CREATE TABLE public.access_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT NOT NULL,
  override_type TEXT NOT NULL CHECK (override_type IN ('grant', 'revoke')),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Create Resources Table
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('recording', 'notes', 'guidance', 'other')),
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  is_attendance_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Create Assignments Table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  due_date TIMESTAMPTZ NOT NULL,
  max_score INTEGER DEFAULT 100,
  attachment_url TEXT,
  is_attendance_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Create Submissions Table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name TEXT,
  notes TEXT,
  score INTEGER,
  feedback TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'resubmit')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES public.profiles(id),
  UNIQUE(assignment_id, student_id)
);

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user's branch
CREATE OR REPLACE FUNCTION public.get_user_branch(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT branch_id FROM public.profiles WHERE id = _user_id
$$;

-- Function to check if user is teacher of a subject
CREATE OR REPLACE FUNCTION public.is_teacher_of_subject(_user_id UUID, _subject_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_subjects
    WHERE teacher_id = _user_id AND subject_id = _subject_id AND is_active = true
  )
$$;

-- Function to check if student has access (attendance >= 75% or override)
CREATE OR REPLACE FUNCTION public.student_has_access(_student_id UUID, _subject_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    -- Check attendance >= 75%
    EXISTS (
      SELECT 1 FROM public.attendance_summary
      WHERE student_id = _student_id 
        AND subject_id = _subject_id 
        AND attendance_percentage >= 75
    )
    OR
    -- Check for active grant override
    EXISTS (
      SELECT 1 FROM public.access_overrides
      WHERE student_id = _student_id 
        AND (subject_id = _subject_id OR subject_id IS NULL)
        AND override_type = 'grant'
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > now())
    )
  )
  AND NOT EXISTS (
    -- Check no active revoke override
    SELECT 1 FROM public.access_overrides
    WHERE student_id = _student_id 
      AND (subject_id = _subject_id OR subject_id IS NULL)
      AND override_type = 'revoke'
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- =============================================
-- TRIGGERS FOR AUTOMATIC CALCULATIONS
-- =============================================

-- Function to update attendance summary
CREATE OR REPLACE FUNCTION public.update_attendance_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_attended INTEGER;
  v_percentage DECIMAL(5,2);
  v_status TEXT;
BEGIN
  -- Calculate totals
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('present', 'late'))
  INTO v_total, v_attended
  FROM public.attendance_records
  WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)
    AND subject_id = COALESCE(NEW.subject_id, OLD.subject_id);

  -- Calculate percentage
  IF v_total > 0 THEN
    v_percentage := (v_attended::DECIMAL / v_total::DECIMAL) * 100;
  ELSE
    v_percentage := 100;
  END IF;

  -- Determine access status
  IF v_percentage >= 75 THEN
    v_status := 'allowed';
  ELSIF v_percentage >= 65 THEN
    v_status := 'at_risk';
  ELSE
    v_status := 'blocked';
  END IF;

  -- Upsert summary
  INSERT INTO public.attendance_summary (student_id, subject_id, total_classes, classes_attended, attendance_percentage, access_status, last_updated)
  VALUES (
    COALESCE(NEW.student_id, OLD.student_id),
    COALESCE(NEW.subject_id, OLD.subject_id),
    v_total,
    v_attended,
    v_percentage,
    v_status,
    now()
  )
  ON CONFLICT (student_id, subject_id) DO UPDATE SET
    total_classes = EXCLUDED.total_classes,
    classes_attended = EXCLUDED.classes_attended,
    attendance_percentage = EXCLUDED.attendance_percentage,
    access_status = EXCLUDED.access_status,
    last_updated = now();

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for attendance updates
CREATE TRIGGER trigger_update_attendance_summary
AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
FOR EACH ROW EXECUTE FUNCTION public.update_attendance_summary();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Default role is student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- BRANCHES POLICIES
CREATE POLICY "Branches are viewable by authenticated users"
  ON public.branches FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can manage branches"
  ON public.branches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Teachers can view students in their subjects"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') AND
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.teacher_subjects ts ON e.subject_id = ts.subject_id
      WHERE e.student_id = profiles.id AND ts.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Super admins can manage all profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- USER ROLES POLICIES
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- SUBJECTS POLICIES
CREATE POLICY "Subjects viewable by authenticated users"
  ON public.subjects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can manage subjects in their branch"
  ON public.subjects FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') AND
    branch_id = public.get_user_branch(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher') AND
    branch_id = public.get_user_branch(auth.uid())
  );

CREATE POLICY "Super admins can manage all subjects"
  ON public.subjects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- TEACHER SUBJECTS POLICIES
CREATE POLICY "Teacher assignments viewable by authenticated"
  ON public.teacher_subjects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can manage teacher assignments"
  ON public.teacher_subjects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ENROLLMENTS POLICIES
CREATE POLICY "Students can view their enrollments"
  ON public.enrollments FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view enrollments in their subjects"
  ON public.enrollments FOR SELECT TO authenticated
  USING (public.is_teacher_of_subject(auth.uid(), subject_id));

CREATE POLICY "Super admins can manage all enrollments"
  ON public.enrollments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Teachers can manage enrollments in their subjects"
  ON public.enrollments FOR ALL TO authenticated
  USING (public.is_teacher_of_subject(auth.uid(), subject_id))
  WITH CHECK (public.is_teacher_of_subject(auth.uid(), subject_id));

-- ATTENDANCE RECORDS POLICIES
CREATE POLICY "Students can view their own attendance"
  ON public.attendance_records FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage attendance in their subjects"
  ON public.attendance_records FOR ALL TO authenticated
  USING (public.is_teacher_of_subject(auth.uid(), subject_id))
  WITH CHECK (public.is_teacher_of_subject(auth.uid(), subject_id));

CREATE POLICY "Super admins can view all attendance"
  ON public.attendance_records FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ATTENDANCE SUMMARY POLICIES
CREATE POLICY "Students can view their own summary"
  ON public.attendance_summary FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view summary for their subjects"
  ON public.attendance_summary FOR SELECT TO authenticated
  USING (public.is_teacher_of_subject(auth.uid(), subject_id));

CREATE POLICY "Super admins can view all summaries"
  ON public.attendance_summary FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ACCESS OVERRIDES POLICIES
CREATE POLICY "Students can view their overrides"
  ON public.access_overrides FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage overrides in their subjects"
  ON public.access_overrides FOR ALL TO authenticated
  USING (public.is_teacher_of_subject(auth.uid(), subject_id))
  WITH CHECK (public.is_teacher_of_subject(auth.uid(), subject_id));

CREATE POLICY "Super admins can manage all overrides"
  ON public.access_overrides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RESOURCES POLICIES (Attendance-Based Access)
CREATE POLICY "Teachers can manage resources"
  ON public.resources FOR ALL TO authenticated
  USING (public.is_teacher_of_subject(auth.uid(), subject_id))
  WITH CHECK (public.is_teacher_of_subject(auth.uid(), subject_id));

CREATE POLICY "Students can view resources if eligible"
  ON public.resources FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'student') AND
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE student_id = auth.uid() AND subject_id = resources.subject_id
    ) AND
    (
      is_attendance_required = false OR
      public.student_has_access(auth.uid(), subject_id)
    )
  );

CREATE POLICY "Super admins can view all resources"
  ON public.resources FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ASSIGNMENTS POLICIES (Attendance-Based Access)
CREATE POLICY "Teachers can manage assignments"
  ON public.assignments FOR ALL TO authenticated
  USING (public.is_teacher_of_subject(auth.uid(), subject_id))
  WITH CHECK (public.is_teacher_of_subject(auth.uid(), subject_id));

CREATE POLICY "Students can view assignments if eligible"
  ON public.assignments FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'student') AND
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE student_id = auth.uid() AND subject_id = assignments.subject_id
    ) AND
    (
      is_attendance_required = false OR
      public.student_has_access(auth.uid(), subject_id)
    )
  );

CREATE POLICY "Super admins can view all assignments"
  ON public.assignments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- SUBMISSIONS POLICIES
CREATE POLICY "Students can manage their submissions"
  ON public.submissions FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view/grade submissions in their subjects"
  ON public.submissions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id
      AND public.is_teacher_of_subject(auth.uid(), a.subject_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id
      AND public.is_teacher_of_subject(auth.uid(), a.subject_id)
    )
  );

CREATE POLICY "Super admins can view all submissions"
  ON public.submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- SEED DATA: Default Branches
-- =============================================
INSERT INTO public.branches (name, code, description) VALUES
  ('Computer Science', 'CS', 'Department of Computer Science and Engineering'),
  ('Mechanical Engineering', 'ME', 'Department of Mechanical Engineering'),
  ('Electrical Engineering', 'EE', 'Department of Electrical and Electronics Engineering'),
  ('Civil Engineering', 'CE', 'Department of Civil Engineering');