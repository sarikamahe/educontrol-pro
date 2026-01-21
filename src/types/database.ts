// EduControl Pro Types

export type AppRole = 'super_admin' | 'teacher' | 'student';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type AccessStatus = 'allowed' | 'at_risk' | 'blocked';

export type ResourceType = 'recording' | 'notes' | 'guidance' | 'other';

export type SubmissionStatus = 'submitted' | 'graded' | 'late' | 'resubmit';

export type OverrideType = 'grant' | 'revoke';

export interface Branch {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  branch_id: string | null;
  enrollment_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  branch_id: string;
  credits: number;
  semester: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherSubject {
  id: string;
  teacher_id: string;
  subject_id: string;
  academic_year: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  subject_id: string;
  academic_year: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  subject_id: string;
  date: string;
  status: AttendanceStatus;
  marked_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSummary {
  id: string;
  student_id: string;
  subject_id: string;
  total_classes: number;
  classes_attended: number;
  attendance_percentage: number;
  access_status: AccessStatus;
  last_updated: string;
}

export interface AccessOverride {
  id: string;
  student_id: string;
  subject_id: string | null;
  granted_by: string;
  reason: string;
  override_type: OverrideType;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  subject_id: string;
  uploaded_by: string;
  is_attendance_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  subject_id: string;
  created_by: string;
  due_date: string;
  max_score: number;
  attachment_url: string | null;
  is_attendance_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string | null;
  file_name: string | null;
  notes: string | null;
  score: number | null;
  feedback: string | null;
  status: SubmissionStatus;
  submitted_at: string;
  graded_at: string | null;
  graded_by: string | null;
}

export interface SubjectBranch {
  id: string;
  subject_id: string;
  branch_id: string;
  is_active: boolean;
  created_at: string;
}
