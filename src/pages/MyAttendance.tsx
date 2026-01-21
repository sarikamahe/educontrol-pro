import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceProgressBar } from '@/components/dashboard/AttendanceProgressBar';
import { AccessStatusBadge } from '@/components/dashboard/AccessStatusBadge';
import { ClipboardCheck, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const subjectAttendance = [
  { id: '1', name: 'Data Structures', code: 'CS201', attended: 34, total: 40, percentage: 85, status: 'allowed' as const },
  { id: '2', name: 'Database Management', code: 'CS301', attended: 28, total: 38, percentage: 74, status: 'at_risk' as const },
  { id: '3', name: 'Machine Learning', code: 'CS401', attended: 18, total: 25, percentage: 72, status: 'at_risk' as const },
  { id: '4', name: 'Operating Systems', code: 'CS302', attended: 32, total: 35, percentage: 91, status: 'allowed' as const },
];

const recentRecords = [
  { date: '2026-01-20', subject: 'Data Structures', status: 'present' },
  { date: '2026-01-20', subject: 'Database Management', status: 'present' },
  { date: '2026-01-19', subject: 'Machine Learning', status: 'absent' },
  { date: '2026-01-19', subject: 'Operating Systems', status: 'present' },
  { date: '2026-01-18', subject: 'Data Structures', status: 'present' },
];

const getOverallStats = () => {
  const totalAttended = subjectAttendance.reduce((sum, s) => sum + s.attended, 0);
  const totalClasses = subjectAttendance.reduce((sum, s) => sum + s.total, 0);
  return {
    attended: totalAttended,
    total: totalClasses,
    percentage: Math.round((totalAttended / totalClasses) * 100),
  };
};

export default function MyAttendance() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const overall = getOverallStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
          <p className="text-muted-foreground">Track your attendance across all subjects</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overall.percentage}%</div>
              <Progress value={overall.percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {overall.attended} of {overall.total} classes attended
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Access Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mt-1">
                <AccessStatusBadge status={overall.percentage >= 75 ? 'allowed' : overall.percentage >= 70 ? 'at_risk' : 'blocked'} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {overall.percentage >= 75 
                  ? 'You have full access to all resources'
                  : overall.percentage >= 70
                  ? 'Warning: Your access may be restricted soon'
                  : 'Your access to resources is currently restricted'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects at Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subjectAttendance.filter(s => s.percentage < 75).length}</div>
              <p className="text-xs text-muted-foreground mt-2">
                subjects below 75% threshold
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Subject-wise Attendance</CardTitle>
              <CardDescription>Your attendance percentage per subject</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjectAttendance.map((subject) => (
                <div key={subject.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">{subject.code}</p>
                    </div>
                    <AccessStatusBadge status={subject.status} />
                  </div>
                  <AttendanceProgressBar 
                    percentage={subject.percentage} 
                    classesAttended={subject.attended} 
                    totalClasses={subject.total} 
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Calendar</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRecords.slice(0, 5).map((record, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{record.subject}</p>
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                    </div>
                    <Badge variant={record.status === 'present' ? 'outline' : 'destructive'} className="text-xs">
                      {record.status === 'present' ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" />Present</>
                      ) : (
                        'Absent'
                      )}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
