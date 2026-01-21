import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, UserPlus, ShieldCheck, ShieldX, ShieldAlert } from 'lucide-react';
import { AccessStatusBadge } from '@/components/dashboard/AccessStatusBadge';
import { useAuth } from '@/contexts/AuthContext';

const mockStudents = [
  { id: '1', name: 'Alice Johnson', email: 'alice@edu.com', enrollmentNo: 'CS2021001', branch: 'Computer Science', attendance: 85, accessStatus: 'allowed' as const },
  { id: '2', name: 'Bob Smith', email: 'bob@edu.com', enrollmentNo: 'CS2021002', branch: 'Computer Science', attendance: 72, accessStatus: 'at_risk' as const },
  { id: '3', name: 'Carol White', email: 'carol@edu.com', enrollmentNo: 'ME2021001', branch: 'Mechanical', attendance: 90, accessStatus: 'allowed' as const },
  { id: '4', name: 'David Brown', email: 'david@edu.com', enrollmentNo: 'EE2021001', branch: 'Electrical', attendance: 68, accessStatus: 'blocked' as const },
  { id: '5', name: 'Eve Davis', email: 'eve@edu.com', enrollmentNo: 'CS2021003', branch: 'Computer Science', attendance: 78, accessStatus: 'allowed' as const },
];

export default function Students() {
  const { isSuperAdmin, isTeacher } = useAuth();
  const canManageStudents = isSuperAdmin || isTeacher;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">View and manage student access and attendance</p>
          </div>
          {canManageStudents && (
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Enroll Student
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Full Access</CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">75%+ attendance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At Risk</CardTitle>
              <ShieldAlert className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">70-75% attendance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked</CardTitle>
              <ShieldX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">&lt;70% attendance</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search students..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                {mockStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{student.enrollmentNo}</TableCell>
                    <TableCell>{student.branch}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              student.attendance >= 75 ? 'bg-green-500' : student.attendance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${student.attendance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{student.attendance}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AccessStatusBadge status={student.accessStatus} />
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Grant Override</DropdownMenuItem>
                            <DropdownMenuItem>View Attendance</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
