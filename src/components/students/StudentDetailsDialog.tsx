import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Building2, GraduationCap, Calendar } from 'lucide-react';
import type { StudentWithAttendance } from '@/hooks/useStudents';

interface StudentDetailsDialogProps {
  student: StudentWithAttendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailsDialog({ student, open, onOpenChange }: StudentDetailsDialogProps) {
  if (!student) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allowed': return 'default';
      case 'at_risk': return 'secondary';
      case 'blocked': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {student.full_name?.charAt(0) || student.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{student.full_name || 'No name'}</h3>
              <p className="text-sm text-muted-foreground">{student.email}</p>
              <Badge variant={getStatusColor(student.accessStatus)} className="mt-1 capitalize">
                {student.accessStatus}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm">{student.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Enrollment Number</p>
                <p className="text-sm">{student.enrollment_number || 'Not assigned'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Branch</p>
                <p className="text-sm">
                  {student.branch ? `${student.branch.name} (${student.branch.code})` : 'Not assigned'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Overall Attendance</p>
                <p className="text-sm font-medium">{student.overallAttendance?.toFixed(1) ?? 0}%</p>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          {student.attendance_summary && student.attendance_summary.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Subject-wise Attendance</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {student.attendance_summary.map((summary: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {summary.subjects?.name || 'Unknown Subject'}
                      </span>
                      <Badge variant={summary.attendance_percentage >= 75 ? 'default' : 'destructive'}>
                        {summary.attendance_percentage?.toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
