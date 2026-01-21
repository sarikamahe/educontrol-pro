import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Search, MoreHorizontal, ShieldCheck, ShieldX, ShieldAlert, Loader2, Eye, KeyRound, ClipboardList } from 'lucide-react';
import { AccessStatusBadge } from '@/components/dashboard/AccessStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents, StudentWithAttendance } from '@/hooks/useStudents';
import { StudentDetailsDialog } from '@/components/students/StudentDetailsDialog';
import { GrantOverrideDialog } from '@/components/students/GrantOverrideDialog';
import { StudentAttendanceDialog } from '@/components/students/StudentAttendanceDialog';

export default function Students() {
  const { isSuperAdmin, isTeacher } = useAuth();
  const canManageStudents = isSuperAdmin || isTeacher;
  const { data: students, isLoading } = useStudents();
  const [search, setSearch] = useState('');
  
  // Dialog states
  const [selectedStudent, setSelectedStudent] = useState<StudentWithAttendance | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  const filteredStudents = students?.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollment_number?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Calculate stats
  const allowedCount = filteredStudents.filter(s => s.accessStatus === 'allowed').length;
  const atRiskCount = filteredStudents.filter(s => s.accessStatus === 'at_risk').length;
  const blockedCount = filteredStudents.filter(s => s.accessStatus === 'blocked').length;

  const handleViewDetails = (student: StudentWithAttendance) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
  };

  const handleGrantOverride = (student: StudentWithAttendance) => {
    setSelectedStudent(student);
    setOverrideOpen(true);
  };

  const handleViewAttendance = (student: StudentWithAttendance) => {
    setSelectedStudent(student);
    setAttendanceOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">View and manage student access and attendance</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Full Access</CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allowedCount}</div>
              <p className="text-xs text-muted-foreground">75%+ attendance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At Risk</CardTitle>
              <ShieldAlert className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{atRiskCount}</div>
              <p className="text-xs text-muted-foreground">65-75% attendance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked</CardTitle>
              <ShieldX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blockedCount}</div>
              <p className="text-xs text-muted-foreground">&lt;65% attendance</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search students..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Enrollment No.</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Access Status</TableHead>
                    {canManageStudents && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar_url || undefined} />
                            <AvatarFallback>{student.full_name?.charAt(0) || 'S'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{student.enrollment_number || '-'}</TableCell>
                      <TableCell>{student.branch?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                student.overallAttendance >= 75 ? 'bg-green-500' : student.overallAttendance >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(student.overallAttendance, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round(student.overallAttendance)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AccessStatusBadge status={student.accessStatus as 'allowed' | 'at_risk' | 'blocked'} />
                          {student.hasActiveOverride && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Override
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {canManageStudents && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleGrantOverride(student)}>
                                <KeyRound className="mr-2 h-4 w-4" />
                                Grant Override
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewAttendance(student)}>
                                <ClipboardList className="mr-2 h-4 w-4" />
                                View Attendance
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {filteredStudents.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={canManageStudents ? 6 : 5} className="text-center py-8 text-muted-foreground">
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <StudentDetailsDialog 
        student={selectedStudent} 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
      />
      <GrantOverrideDialog 
        student={selectedStudent} 
        open={overrideOpen} 
        onOpenChange={setOverrideOpen} 
      />
      <StudentAttendanceDialog 
        student={selectedStudent} 
        open={attendanceOpen} 
        onOpenChange={setAttendanceOpen} 
      />
    </DashboardLayout>
  );
}
