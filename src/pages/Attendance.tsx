import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Check, X, Clock, Save, Loader2, Lock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useSubjects } from '@/hooks/useSubjects';
import { useEnrolledStudents, useMarkAttendance, useAttendanceRecords } from '@/hooks/useAttendance';

interface AttendanceEntry {
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'not_marked';
}

export default function Attendance() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceEntry>>({});
  
  const { user, isSuperAdmin, isTeacher, profile } = useAuth();
  const canManageAttendance = isSuperAdmin || isTeacher;
  
  // For teachers, filter subjects by their branch
  const { data: allSubjects, isLoading: subjectsLoading } = useSubjects();
  const subjects = isTeacher && profile?.branch_id 
    ? allSubjects?.filter(s => s.branch_id === profile.branch_id) 
    : allSubjects;
  
  const { data: enrolledStudents, isLoading: studentsLoading } = useEnrolledStudents(selectedSubject || undefined);
  const { data: existingRecords, isLoading: recordsLoading } = useAttendanceRecords(
    selectedSubject || undefined, 
    format(date, 'yyyy-MM-dd')
  );
  const markAttendance = useMarkAttendance();

  // Check if attendance is already marked (locked)
  const isAttendanceLocked = existingRecords && existingRecords.length > 0;
  const markedBy = existingRecords?.[0]?.marked_by;
  const markedAt = existingRecords?.[0]?.created_at;

  // Initialize attendance data from existing records
  useEffect(() => {
    if (enrolledStudents) {
      const newAttendanceData: Record<string, AttendanceEntry> = {};
      
      enrolledStudents.forEach(enrollment => {
        const existingRecord = existingRecords?.find(
          r => r.student_id === enrollment.profiles?.id
        );
        newAttendanceData[enrollment.profiles?.id || ''] = {
          student_id: enrollment.profiles?.id || '',
          status: (existingRecord?.status as any) || 'not_marked',
        };
      });
      
      setAttendanceData(newAttendanceData);
    }
  }, [existingRecords, enrolledStudents]);

  const toggleStatus = (studentId: string, newStatus: 'present' | 'absent' | 'late') => {
    if (isAttendanceLocked) return; // Prevent changes if locked
    
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        student_id: studentId,
        status: newStatus,
      },
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedSubject || !user || isAttendanceLocked) return;
    
    const records = Object.values(attendanceData)
      .filter(entry => entry.status !== 'not_marked' && entry.student_id && entry.student_id.trim() !== '')
      .map(entry => ({
        student_id: entry.student_id,
        subject_id: selectedSubject,
        date: format(date, 'yyyy-MM-dd'),
        status: entry.status as 'present' | 'absent' | 'late' | 'excused',
        marked_by: user.id,
      }));
    
    if (records.length > 0) {
      markAttendance.mutate(records);
    } else {
      toast.error('No valid attendance entries to save. Please mark at least one student.');
    }
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

  const isLoading = subjectsLoading || studentsLoading || recordsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground">Mark and manage student attendance</p>
          </div>
          {canManageAttendance && selectedSubject && !isAttendanceLocked && (
            <Button onClick={handleSaveAttendance} disabled={markAttendance.isPending}>
              {markAttendance.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
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
              {subjects?.map((subject) => (
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

        {/* Locked Attendance Alert */}
        {isAttendanceLocked && selectedSubject && (
          <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
            <Lock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
              Attendance for this date has already been marked and cannot be modified.
              {markedAt && (
                <span className="block text-xs mt-1">
                  Marked on {format(new Date(markedAt), 'PPP p')}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {isAttendanceLocked ? 'Attendance Record (Read-only)' : 'Mark Attendance'}
              </CardTitle>
              {isAttendanceLocked && (
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" /> Locked
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedSubject ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Please select a subject to mark attendance</p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Enrollment No.</TableHead>
                    <TableHead>Overall Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    {canManageAttendance && !isAttendanceLocked && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledStudents?.map((enrollment) => {
                    const student = enrollment.profiles;
                    const summary = enrollment.attendance_summary;
                    const attendancePercentage = summary?.attendance_percentage ?? 100;
                    const studentStatus = attendanceData[student?.id || '']?.status || 'not_marked';
                    
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student?.avatar_url || undefined} />
                              <AvatarFallback>{student?.full_name?.charAt(0) || 'S'}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student?.full_name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{student?.enrollment_number || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  attendancePercentage >= 75 ? 'bg-green-500' : attendancePercentage >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                                )}
                                style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm">{Math.round(attendancePercentage)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(studentStatus)}</TableCell>
                        {canManageAttendance && !isAttendanceLocked && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={studentStatus === 'present' ? 'default' : 'outline'}
                                className="h-8 w-8 p-0"
                                onClick={() => toggleStatus(student?.id || '', 'present')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={studentStatus === 'absent' ? 'destructive' : 'outline'}
                                className="h-8 w-8 p-0"
                                onClick={() => toggleStatus(student?.id || '', 'absent')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={studentStatus === 'late' ? 'secondary' : 'outline'}
                                className="h-8 w-8 p-0"
                                onClick={() => toggleStatus(student?.id || '', 'late')}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                  {(!enrolledStudents || enrolledStudents.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={canManageAttendance && !isAttendanceLocked ? 5 : 4} className="text-center py-8 text-muted-foreground">
                        No students enrolled in this subject
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}