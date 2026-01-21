import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceProgressBar } from '@/components/dashboard/AttendanceProgressBar';
import { AccessStatusBadge } from '@/components/dashboard/AccessStatusBadge';
import { ClipboardCheck, TrendingUp, AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentAttendance } from '@/hooks/useAttendance';
import { format } from 'date-fns';

export default function MyAttendance() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { user } = useAuth();
  const { data: attendanceData, isLoading } = useStudentAttendance(user?.id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const subjectSummaries = attendanceData?.summary || [];
  const recentRecords = attendanceData?.records || [];

  // Calculate overall stats
  const totalAttended = subjectSummaries.reduce((sum, s) => sum + (s.classes_attended || 0), 0);
  const totalClasses = subjectSummaries.reduce((sum, s) => sum + (s.total_classes || 0), 0);
  const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 100;
  
  let overallStatus: 'allowed' | 'at_risk' | 'blocked' = 'allowed';
  if (overallPercentage < 65) overallStatus = 'blocked';
  else if (overallPercentage < 75) overallStatus = 'at_risk';

  const subjectsAtRisk = subjectSummaries.filter(s => (s.attendance_percentage || 0) < 75).length;

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
              <div className="text-3xl font-bold">{overallPercentage}%</div>
              <Progress value={overallPercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {totalAttended} of {totalClasses} classes attended
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
                <AccessStatusBadge status={overallStatus} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {overallStatus === 'allowed'
                  ? 'You have full access to all resources'
                  : overallStatus === 'at_risk'
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
              <div className="text-3xl font-bold">{subjectsAtRisk}</div>
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
              {subjectSummaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No enrollment data found
                </div>
              ) : (
                subjectSummaries.map((summary) => {
                  const percentage = summary.attendance_percentage || 0;
                  let status: 'allowed' | 'at_risk' | 'blocked' = 'allowed';
                  if (percentage < 65) status = 'blocked';
                  else if (percentage < 75) status = 'at_risk';

                  return (
                    <div key={summary.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{summary.subjects?.name || 'Unknown Subject'}</p>
                          <p className="text-sm text-muted-foreground">{summary.subjects?.code || '-'}</p>
                        </div>
                        <AccessStatusBadge status={status} />
                      </div>
                      <AttendanceProgressBar 
                        percentage={Math.round(percentage)} 
                        classesAttended={summary.classes_attended || 0} 
                        totalClasses={summary.total_classes || 0} 
                      />
                    </div>
                  );
                })
              )}
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
                {recentRecords.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No attendance records found
                  </div>
                ) : (
                  recentRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{record.subjects?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
                      </div>
                      <Badge 
                        variant={record.status === 'present' || record.status === 'late' ? 'outline' : 'destructive'} 
                        className="text-xs"
                      >
                        {record.status === 'present' ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" />Present</>
                        ) : record.status === 'late' ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" />Late</>
                        ) : (
                          <><X className="h-3 w-3 mr-1" />Absent</>
                        )}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
