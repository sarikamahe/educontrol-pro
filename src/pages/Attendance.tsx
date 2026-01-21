import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, X, Clock, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const mockStudents = [
  { id: '1', name: 'Alice Johnson', enrollmentNo: 'CS2021001', attendance: 85, status: 'present' },
  { id: '2', name: 'Bob Smith', enrollmentNo: 'CS2021002', attendance: 72, status: 'absent' },
  { id: '3', name: 'Carol White', enrollmentNo: 'CS2021003', attendance: 90, status: 'present' },
  { id: '4', name: 'David Brown', enrollmentNo: 'CS2021004', attendance: 68, status: 'late' },
  { id: '5', name: 'Eve Davis', enrollmentNo: 'CS2021005', attendance: 78, status: 'present' },
];

const subjects = [
  { id: '1', name: 'Data Structures', code: 'CS201' },
  { id: '2', name: 'Database Management', code: 'CS301' },
  { id: '3', name: 'Machine Learning', code: 'CS401' },
];

export default function Attendance() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState(mockStudents);
  const { isSuperAdmin, isTeacher } = useAuth();
  const canManageAttendance = isSuperAdmin || isTeacher;

  const toggleStatus = (studentId: string, newStatus: string) => {
    setAttendanceData(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500 hover:bg-green-600"><Check className="mr-1 h-3 w-3" />Present</Badge>;
      case 'absent':
        return <Badge variant="destructive"><X className="mr-1 h-3 w-3" />Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="mr-1 h-3 w-3" />Late</Badge>;
      default:
        return <Badge variant="secondary">Not Marked</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground">Mark and manage student attendance</p>
          </div>
          {canManageAttendance && (
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Attendance
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('w-[200px] justify-start text-left font-normal')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Enrollment No.</TableHead>
                  <TableHead>Overall Attendance</TableHead>
                  <TableHead>Today's Status</TableHead>
                  {canManageAttendance && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{student.enrollmentNo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              student.attendance >= 75 ? 'bg-green-500' : student.attendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            )}
                            style={{ width: `${student.attendance}%` }}
                          />
                        </div>
                        <span className="text-sm">{student.attendance}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    {canManageAttendance && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={student.status === 'present' ? 'default' : 'outline'}
                            className="h-8 w-8 p-0"
                            onClick={() => toggleStatus(student.id, 'present')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === 'absent' ? 'destructive' : 'outline'}
                            className="h-8 w-8 p-0"
                            onClick={() => toggleStatus(student.id, 'absent')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === 'late' ? 'secondary' : 'outline'}
                            className="h-8 w-8 p-0"
                            onClick={() => toggleStatus(student.id, 'late')}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
