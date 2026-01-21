import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  ClipboardCheck,
  FileText,
  FolderOpen,
  Calendar,
  ArrowRight,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    todayClasses: 0
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch teacher's subjects
      const { data: teacherSubjects } = await supabase
        .from('teacher_subjects')
        .select(`
          *,
          subject:subjects(*)
        `)
        .eq('teacher_id', user?.id)
        .eq('is_active', true);

      if (teacherSubjects) {
        const subjectsList = teacherSubjects.map(ts => ts.subject);
        setSubjects(subjectsList);
        setStats(prev => ({ ...prev, totalSubjects: subjectsList.length }));

        // Get unique students enrolled in these subjects
        const subjectIds = subjectsList.map(s => s?.id).filter(Boolean);
        if (subjectIds.length > 0) {
          const { count: studentsCount } = await supabase
            .from('enrollments')
            .select('student_id', { count: 'exact', head: true })
            .in('subject_id', subjectIds)
            .eq('is_active', true);
          
          if (studentsCount !== null) {
            setStats(prev => ({ ...prev, totalStudents: studentsCount }));
          }
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Teacher'}!
          </h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/attendance">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Mark Attendance
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Subjects"
          value={stats.totalSubjects}
          description="Active subjects assigned"
          icon={BookOpen}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          description="Enrolled in your subjects"
          icon={Users}
          iconClassName="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatsCard
          title="Pending Reviews"
          value={stats.pendingAssignments}
          description="Assignments to grade"
          icon={FileText}
          iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
        <StatsCard
          title="Today's Classes"
          value={stats.todayClasses}
          description="Scheduled for today"
          icon={Calendar}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Subjects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Subjects</CardTitle>
              <CardDescription>Subjects you're teaching this semester</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/subjects">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No subjects assigned yet</p>
                <p className="text-sm">Contact your administrator to get subjects assigned</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.slice(0, 4).map((subject) => (
                  <div
                    key={subject?.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                        {subject?.code?.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-medium">{subject?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {subject?.credits} Credits • Semester {subject?.semester || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/subjects/${subject?.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
              <Link to="/attendance">
                <ClipboardCheck className="mr-3 h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Mark Today's Attendance</p>
                  <p className="text-xs text-muted-foreground">Record student attendance for your classes</p>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
              <Link to="/resources">
                <FolderOpen className="mr-3 h-5 w-5 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">Upload Resources</p>
                  <p className="text-xs text-muted-foreground">Add notes, recordings, or guidance materials</p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
              <Link to="/assignments">
                <FileText className="mr-3 h-5 w-5 text-orange-500" />
                <div className="text-left">
                  <p className="font-medium">Create Assignment</p>
                  <p className="text-xs text-muted-foreground">Assign work to students with deadlines</p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
              <Link to="/students">
                <Users className="mr-3 h-5 w-5 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">View Students</p>
                  <p className="text-xs text-muted-foreground">Check attendance status and manage access</p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Students Needing Attention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Students Needing Attention
          </CardTitle>
          <CardDescription>
            Students with attendance below 75% or at risk of access restriction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
            <p>All students are maintaining good attendance!</p>
            <p className="text-sm">No students currently at risk</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
