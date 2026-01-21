import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Users, BookOpen, ClipboardCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import { useStudents } from '@/hooks/useStudents';
import { useSubjects } from '@/hooks/useSubjects';

export default function Analytics() {
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();

  const isLoading = branchesLoading || studentsLoading || subjectsLoading;

  // Calculate stats
  const totalStudents = students?.length || 0;
  const atRiskStudents = students?.filter(s => s.accessStatus === 'at_risk' || s.accessStatus === 'blocked').length || 0;
  const avgAttendance = students?.length 
    ? Math.round(students.reduce((sum, s) => sum + (s.overallAttendance || 0), 0) / students.length) 
    : 0;
  const activeSubjects = subjects?.filter(s => s.is_active).length || 0;

  // Calculate branch statistics
  const branchStats = branches?.map(branch => {
    const branchStudents = students?.filter(s => s.branch_id === branch.id) || [];
    const branchSubjects = subjects?.filter(s => s.branch_id === branch.id) || [];
    const avgAttendance = branchStudents.length 
      ? Math.round(branchStudents.reduce((sum, s) => sum + (s.overallAttendance || 0), 0) / branchStudents.length)
      : 0;
    const atRisk = branchStudents.filter(s => s.accessStatus === 'at_risk' || s.accessStatus === 'blocked').length;

    return {
      name: branch.name,
      code: branch.code,
      students: branchStudents.length,
      subjects: branchSubjects.length,
      avgAttendance,
      atRisk,
    };
  }) || [];

  const stats = [
    { title: 'Total Students', value: totalStudents.toString(), change: '+0%', trend: 'up' as const, icon: Users },
    { title: 'Avg Attendance', value: `${avgAttendance}%`, change: '+0%', trend: 'up' as const, icon: ClipboardCheck },
    { title: 'At Risk Students', value: atRiskStudents.toString(), change: '0%', trend: 'down' as const, icon: AlertTriangle },
    { title: 'Active Subjects', value: activeSubjects.toString(), change: '+0', trend: 'up' as const, icon: BookOpen },
  ];

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
          <Select defaultValue="semester">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">from last period</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
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
                          className={`h-full rounded-full ${
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
                <div className="space-y-4">
                  {branchStats.map((branch) => (
                    <div key={branch.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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

        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trend</CardTitle>
            <CardDescription>Attendance patterns over the past weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Charts will be added when more attendance data is available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
