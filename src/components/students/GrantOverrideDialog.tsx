import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGrantOverride } from '@/hooks/useStudents';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { StudentWithAttendance } from '@/hooks/useStudents';

interface GrantOverrideDialogProps {
  student: StudentWithAttendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GrantOverrideDialog({ student, open, onOpenChange }: GrantOverrideDialogProps) {
  const [reason, setReason] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<Date>();
  
  const { user } = useAuth();
  const { data: subjects } = useSubjects();
  const grantOverride = useGrantOverride();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !user) return;
    
    await grantOverride.mutateAsync({
      studentId: student.id,
      subjectId: subjectId || undefined,
      reason,
      grantedBy: user.id,
      expiresAt: expiresAt?.toISOString(),
    });
    
    setReason('');
    setSubjectId('');
    setExpiresAt(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant Access Override</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              Granting override for: <strong>{student?.full_name || student?.email}</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Current attendance: {student?.overallAttendance?.toFixed(1) ?? 0}%
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="override-subject">Subject (Optional)</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="All subjects (global override)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All subjects (global)</SelectItem>
                {subjects?.filter(s => s.is_active).map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Leave empty to grant access to all subjects
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="override-reason">Reason *</Label>
            <Textarea
              id="override-reason"
              placeholder="Explain why this override is being granted..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Expiry Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiresAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiresAt ? format(expiresAt, "PPP") : "No expiry (permanent)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiresAt}
                  onSelect={setExpiresAt}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={grantOverride.isPending || !reason}>
              {grantOverride.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Grant Override
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
