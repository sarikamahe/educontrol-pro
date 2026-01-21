import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useStudentAttendance } from '@/hooks/useAttendance';
import { format } from 'date-fns';
import type { StudentWithAttendance } from '@/hooks/useStudents';

interface StudentAttendanceDialogProps {
  student: StudentWithAttendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentAttendanceDialog({ student, open, onOpenChange }: StudentAttendanceDialogProps) {
  const { data, isLoading } = useStudentAttendance(student?.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Present</Badge>;
      case 'absent': return <Badge variant="destructive">Absent</Badge>;
      case 'late': return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Late</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Attendance History - {student?.full_name || student?.email}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Summary by Subject */}
            {data?.summary && data.summary.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Subject Summary</h4>
                <div className="grid gap-2">
                  {data.summary.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{item.subjects?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.classes_attended}/{item.total_classes} classes
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.attendance_percentage >= 75 ? 'default' : 'destructive'}>
                          {item.attendance_percentage?.toFixed(0)}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {item.access_status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Records */}
            {data?.records && data.records.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Recent Records</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Subject</th>
                        <th className="text-left p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.records.map((record: any) => (
                        <tr key={record.id}>
                          <td className="p-3">
                            {format(new Date(record.date), 'MMM d, yyyy')}
                          </td>
                          <td className="p-3">
                            {record.subjects?.name || 'Unknown'}
                          </td>
                          <td className="p-3">
                            {getStatusBadge(record.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(!data?.records || data.records.length === 0) && (!data?.summary || data.summary.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                No attendance records found
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
