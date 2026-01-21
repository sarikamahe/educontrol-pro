import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Users, BookOpen, ClipboardCheck, AlertTriangle } from 'lucide-react';

const stats = [
  { title: 'Total Students', value: '324', change: '+12%', trend: 'up', icon: Users },
  { title: 'Avg Attendance', value: '78.5%', change: '+3.2%', trend: 'up', icon: ClipboardCheck },
  { title: 'At Risk Students', value: '42', change: '-8%', trend: 'down', icon: AlertTriangle },
  { title: 'Active Subjects', value: '26', change: '+2', trend: 'up', icon: BookOpen },
];

const branchData = [
  { name: 'Computer Science', students: 120, avgAttendance: 82, atRisk: 12 },
  { name: 'Mechanical', students: 95, avgAttendance: 75, atRisk: 18 },
  { name: 'Electrical', students: 88, avgAttendance: 79, atRisk: 8 },
  { name: 'Civil', students: 72, avgAttendance: 71, atRisk: 15 },
];

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track attendance and performance metrics</p>
          </div>
          <Select defaultValue="week">
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
              <div className="space-y-4">
                {branchData.map((branch) => (
                  <div key={branch.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{branch.name}</span>
                      <span className="text-sm text-muted-foreground">{branch.avgAttendance}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          branch.avgAttendance >= 75 ? 'bg-green-500' : branch.avgAttendance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${branch.avgAttendance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branch Overview</CardTitle>
              <CardDescription>Students and at-risk count per branch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {branchData.map((branch) => (
                  <div key={branch.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{branch.name}</p>
                      <p className="text-sm text-muted-foreground">{branch.students} students</p>
                    </div>
                    <Badge variant={branch.atRisk > 15 ? 'destructive' : branch.atRisk > 10 ? 'secondary' : 'outline'}>
                      {branch.atRisk} at risk
                    </Badge>
                  </div>
                ))}
              </div>
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
                <p>Chart visualization will be implemented with real data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
