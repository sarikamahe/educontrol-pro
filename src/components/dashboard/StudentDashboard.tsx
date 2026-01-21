import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StatsCard } from './StatsCard';
import { AttendanceProgressBar } from './AttendanceProgressBar';
import { AccessStatusBadge } from './AccessStatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  ClipboardCheck,
  FileText,
  FolderOpen,
  MessageSquare,
  ArrowRight,
  Calendar,
  TrendingUp,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AttendanceSummary, Subject } from '@/types/database';

interface SubjectWithAttendance extends Subject {
  attendance?: AttendanceSummary;
}

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [accessStatus, setAccessStatus] = useState<'allowed' | 'at_risk' | 'blocked'>('allowed');
  const [enrolledSubjects, setEnrolledSubjects] = useState<SubjectWithAttendance[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      // Fetch enrolled subjects
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          subject:subjects(*)
        `)
        .eq('student_id', user?.id)
        .eq('is_active', true);

      // Fetch attendance summaries
      const { data: summaries } = await supabase
        .from('attendance_summary')
        .select('*')
        .eq('student_id', user?.id);

      if (enrollments && summaries) {
        const subjectsWithAttendance = enrollments.map(e => ({
          ...e.subject,
          attendance: summaries.find(s => s.subject_id === e.subject?.id)
        })) as SubjectWithAttendance[];
        
        setEnrolledSubjects(subjectsWithAttendance);

        // Calculate overall attendance
        if (summaries.length > 0) {
          const totalPercentage = summaries.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0);
          const avgAttendance = totalPercentage / summaries.length;
          setOverallAttendance(avgAttendance);

          // Determine overall access status
          if (avgAttendance < 65) {
            setAccessStatus('blocked');
          } else if (avgAttendance < 75) {
            setAccessStatus('at_risk');
          } else {
            setAccessStatus('allowed');
          }
        }
      }

      // Fetch upcoming assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('*')
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (assignments) {
        setUpcomingDeadlines(assignments);
      }

    } catch (error) {
      console.error('Error fetching student data:', error);
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
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hello, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <AccessStatusBadge status={accessStatus} size="lg" />
          <p className="text-sm text-muted-foreground">
            {accessStatus === 'allowed' 
              ? 'You have full access to all resources' 
              : accessStatus === 'at_risk'
              ? 'Improve attendance to maintain access'
              : 'Your access is restricted due to low attendance'}
          </p>
        </div>
      </div>

      {/* Overall Attendance Card */}
      <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Overall Attendance</h3>
              </div>
              <AttendanceProgressBar 
                percentage={overallAttendance} 
                accessStatus={accessStatus}
                size="lg"
              />
              <p className="text-sm text-muted-foreground mt-3">
                Maintain at least 75% attendance to access all resources and assignments.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-background rounded-xl min-w-[120px]">
              <span className="text-4xl font-bold text-primary">{overallAttendance.toFixed(1)}%</span>
              <span className="text-sm text-muted-foreground">Attendance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Enrolled Subjects"
          value={enrolledSubjects.length}
          description="Active this semester"
          icon={BookOpen}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatsCard
          title="Classes Attended"
          value={enrolledSubjects.reduce((sum, s) => sum + (s.attendance?.classes_attended || 0), 0)}
          description="Total classes present"
          icon={ClipboardCheck}
          iconClassName="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatsCard
          title="Pending Assignments"
          value={upcomingDeadlines.length}
          description="Due this week"
          icon={FileText}
          iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
        <StatsCard
          title="Resources Available"
          value={accessStatus === 'blocked' ? 'Locked' : 'Unlocked'}
          description={accessStatus === 'blocked' ? 'Improve attendance' : 'Full access granted'}
          icon={FolderOpen}
          iconClassName={accessStatus === 'blocked' 
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subject-wise Attendance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Subject-wise Attendance</CardTitle>
              <CardDescription>Your attendance in each enrolled subject</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/my-attendance">
                Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {enrolledSubjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No subjects enrolled yet</p>
                <p className="text-sm">Contact your teacher to get enrolled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledSubjects.map((subject) => (
                  <div key={subject.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{subject.code}</Badge>
                        <span className="font-medium text-sm">{subject.name}</span>
                      </div>
                    </div>
                    <AttendanceProgressBar 
                      percentage={subject.attendance?.attendance_percentage || 100}
                      accessStatus={subject.attendance?.access_status as any || 'allowed'}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Assignments due soon</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/assignments">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming deadlines</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/assignments/${assignment.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Resources</h3>
                <p className="text-sm text-muted-foreground">Notes & Recordings</p>
              </div>
              <Button size="sm" variant="secondary" asChild>
                <Link to="/resources">Go</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Assignments</h3>
                <p className="text-sm text-muted-foreground">Submit your work</p>
              </div>
              <Button size="sm" variant="secondary" asChild>
                <Link to="/assignments">Go</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-white">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Ask doubts</p>
              </div>
              <Button size="sm" variant="secondary" asChild>
                <Link to="/assistant">Go</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
