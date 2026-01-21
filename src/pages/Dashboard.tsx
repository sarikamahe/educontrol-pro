import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

export default function Dashboard() {
  const { isSuperAdmin, isTeacher, isStudent } = useAuth();

  return (
    <DashboardLayout>
      {isSuperAdmin && <SuperAdminDashboard />}
      {isTeacher && !isSuperAdmin && <TeacherDashboard />}
      {isStudent && !isTeacher && !isSuperAdmin && <StudentDashboard />}
    </DashboardLayout>
  );
}
