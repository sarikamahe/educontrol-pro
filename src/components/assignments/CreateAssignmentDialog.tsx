import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useBranches } from '@/hooks/useBranches';
import { useSubjects } from '@/hooks/useSubjects';
import { useCreateAssignment } from '@/hooks/useAssignments';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CalendarIcon, Upload, File, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAssignmentDialog({ open, onOpenChange }: CreateAssignmentDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [branchId, setBranchId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [maxScore, setMaxScore] = useState('100');
  const [isAttendanceRequired, setIsAttendanceRequired] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user, profile, isTeacher, isSuperAdmin } = useAuth();
  const { data: branches } = useBranches();
  const { data: subjects } = useSubjects();
  const createAssignment = useCreateAssignment();

  // Auto-select teacher's branch
  const effectiveBranchId = isTeacher && profile?.branch_id ? profile.branch_id : branchId;
  
  // Filter subjects by selected branch
  const filteredSubjects = subjects?.filter(s => 
    s.is_active && s.branch_id === effectiveBranchId
  ) || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !dueDate || !user) return;
    
    await createAssignment.mutateAsync({
      title,
      description: description || undefined,
      subjectId,
      dueDate: dueDate.toISOString(),
      maxScore: parseInt(maxScore) || 100,
      createdBy: user.id,
      isAttendanceRequired,
      file: file || undefined,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setBranchId('');
    setSubjectId('');
    setDueDate(undefined);
    setMaxScore('100');
    setFile(null);
    setIsAttendanceRequired(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assignment-title">Title *</Label>
            <Input
              id="assignment-title"
              placeholder="e.g., Lab Report 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="assignment-branch">Branch *</Label>
              <Select value={branchId} onValueChange={(v) => { setBranchId(v); setSubjectId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.filter(b => b.is_active).map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="assignment-subject">Subject *</Label>
            <Select value={subjectId} onValueChange={setSubjectId} disabled={!effectiveBranchId}>
              <SelectTrigger>
                <SelectValue placeholder={effectiveBranchId ? "Select a subject" : "Select branch first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-score">Max Score</Label>
              <Input
                id="max-score"
                type="number"
                min="1"
                max="1000"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment-description">Description</Label>
            <Textarea
              id="assignment-description"
              placeholder="Assignment instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachment (Optional)</Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <File className="h-6 w-6 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Attach file
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="assignment-attendance-required">Require 75% Attendance</Label>
              <p className="text-xs text-muted-foreground">Students need minimum attendance to submit</p>
            </div>
            <Switch
              id="assignment-attendance-required"
              checked={isAttendanceRequired}
              onCheckedChange={setIsAttendanceRequired}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAssignment.isPending || !title || !subjectId || !dueDate}>
              {createAssignment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
