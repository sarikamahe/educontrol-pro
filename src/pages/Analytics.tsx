import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, BookOpen, ClipboardCheck, AlertTriangle, Loader2, GraduationCap } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import { useStudents } from '@/hooks/useStudents';
import { useSubjects } from '@/hooks/useSubjects';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

export default function Analytics() {
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const [teacherCount, setTeacherCount] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ date: string; attendance: number; present: number; total: number }[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(true);

  const isLoading = branchesLoading || studentsLoading || subjectsLoading;

  // Fetch teacher count
  useEffect(() => {
    const fetchTeacherCount = async () => {
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher');
      setTeacherCount(count || 0);
    };
    fetchTeacherCount();
  }, []);

  // Fetch weekly attendance data
  useEffect(() => {
    const fetchWeeklyTrend = async () => {
      setLoadingTrend(true);
      try {
        const endDate = new Date();
        const startDate = subDays(endDate, 13); // Last 2 weeks
        
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        
        const weeklyStats = await Promise.all(
          days.map(async (day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            
            const { data: records } = await supabase
              .from('attendance_records')
              .select('status')
              .eq('date', dateStr);
            
            const total = records?.length || 0;
            const present = records?.filter(r => r.status === 'present' || r.status === 'late').length || 0;
            const attendance = total > 0 ? Math.round((present / total) * 100) : 0;
            
            return {
              date: format(day, 'MMM d'),
              attendance,
              present,
              total,
            };
          })
        );
        
        setWeeklyData(weeklyStats);
      } catch (error) {
        console.error('Error fetching weekly trend:', error);
      } finally {
        setLoadingTrend(false);
      }
    };
    
    fetchWeeklyTrend();
  }, []);

  // Helper to get branch IDs from a subject using junction table
  const getSubjectBranchIds = (subject: any): string[] => {
    if (subject.subject_branches && subject.subject_branches.length > 0) {
      return subject.subject_branches
        .filter((sb: any) => sb.is_active)
        .map((sb: any) => sb.branch_id);
    }
    // Fall back to single branch_id
    return subject.branch_id ? [subject.branch_id] : [];
  };

  // Calculate stats
  const totalStudents = students?.length || 0;
  const atRiskStudents = students?.filter(s => s.accessStatus === 'at_risk' || s.accessStatus === 'blocked').length || 0;
  const avgAttendance = students?.length 
    ? Math.round(students.reduce((sum, s) => sum + (s.overallAttendance || 0), 0) / students.length) 
    : 0;
  const activeSubjects = subjects?.filter(s => s.is_active).length || 0;

  // Calculate branch statistics - count subjects via junction table
  const branchStats = branches?.map(branch => {
    const branchStudents = students?.filter(s => s.branch_id === branch.id) || [];
    
    // Count subjects that belong to this branch via junction table
    const branchSubjects = subjects?.filter(s => {
      const subjectBranchIds = getSubjectBranchIds(s);
      return subjectBranchIds.includes(branch.id);
    }) || [];
    
    const avgAtt = branchStudents.length 
      ? Math.round(branchStudents.reduce((sum, s) => sum + (s.overallAttendance || 0), 0) / branchStudents.length)
      : 0;
    const atRisk = branchStudents.filter(s => s.accessStatus === 'at_risk' || s.accessStatus === 'blocked').length;

    return {
      name: branch.name,
      code: branch.code,
      students: branchStudents.length,
      subjects: branchSubjects.length,
      avgAttendance: avgAtt,
      atRisk,
    };
  }) || [];

  const stats = [
    { title: 'Total Students', value: totalStudents.toString(), icon: Users, color: 'text-blue-500' },
    { title: 'Teachers', value: teacherCount.toString(), icon: GraduationCap, color: 'text-purple-500' },
    { title: 'Avg Attendance', value: `${avgAttendance}%`, icon: ClipboardCheck, color: 'text-green-500' },
    { title: 'At Risk Students', value: atRiskStudents.toString(), icon: AlertTriangle, color: 'text-yellow-500' },
    { title: 'Active Subjects', value: activeSubjects.toString(), icon: BookOpen, color: 'text-indigo-500' },
  ];

  const chartConfig = {
    attendance: {
      label: "Attendance %",
      color: "hsl(var(--primary))",
    },
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track attendance and performance metrics</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend</CardTitle>
              <CardDescription>Daily attendance percentage over the last 2 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTrend ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : weeklyData.some(d => d.total > 0) ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="attendance" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No attendance data available yet</p>
                    <p className="text-sm">Start marking attendance to see trends</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance by Branch</CardTitle>
              <CardDescription>Average attendance percentage per department</CardDescription>
            </CardHeader>
            <CardContent>
              {branchStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No branch data available
                </div>
              ) : (
                <div className="space-y-4">
                  {branchStats.map((branch) => (
                    <div key={branch.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{branch.name}</span>
                        <span className="text-sm text-muted-foreground">{branch.avgAttendance}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            branch.avgAttendance >= 75 ? 'bg-green-500' : branch.avgAttendance >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${branch.avgAttendance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Branch Overview</CardTitle>
            <CardDescription>Students and at-risk count per branch</CardDescription>
          </CardHeader>
          <CardContent>
            {branchStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No branch data available
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {branchStats.map((branch) => (
                  <div key={branch.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{branch.name}</p>
                      <p className="text-sm text-muted-foreground">{branch.students} students • {branch.subjects} subjects</p>
                    </div>
                    <Badge variant={branch.atRisk > 5 ? 'destructive' : branch.atRisk > 2 ? 'secondary' : 'outline'}>
                      {branch.atRisk} at risk
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
