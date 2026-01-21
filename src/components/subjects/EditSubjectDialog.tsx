import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUpdateSubject } from '@/hooks/useSubjects';
import { useBranches } from '@/hooks/useBranches';
import { Loader2 } from 'lucide-react';

interface EditSubjectDialogProps {
  subject: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    branch_id: string;
    credits: number;
    semester: number | null;
    is_active: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSubjectDialog({ subject, open, onOpenChange }: EditSubjectDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [branchId, setBranchId] = useState('');
  const [semester, setSemester] = useState('');
  const [credits, setCredits] = useState('3');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const updateSubject = useUpdateSubject();
  const { data: branches } = useBranches();

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setCode(subject.code);
      setBranchId(subject.branch_id);
      setSemester(subject.semester?.toString() || '');
      setCredits(subject.credits?.toString() || '3');
      setDescription(subject.description || '');
      setIsActive(subject.is_active);
    }
  }, [subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;
    
    await updateSubject.mutateAsync({
      id: subject.id,
      name,
      code: code.toUpperCase(),
      branch_id: branchId,
      semester: semester ? parseInt(semester) : null,
      credits: parseInt(credits) || 3,
      description: description || null,
      is_active: isActive,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subject-name">Subject Name *</Label>
              <Input
                id="edit-subject-name"
                placeholder="e.g., Data Structures"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subject-code">Subject Code *</Label>
              <Input
                id="edit-subject-code"
                placeholder="e.g., CS201"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={10}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-branch">Branch *</Label>
            <Select value={branchId} onValueChange={setBranchId} required>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-semester">Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-credits">Credits</Label>
              <Input
                id="edit-credits"
                type="number"
                min="1"
                max="10"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-subject-description">Description</Label>
            <Textarea
              id="edit-subject-description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-is-active">Active Status</Label>
            <Switch
              id="edit-is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateSubject.isPending || !name || !code || !branchId}>
              {updateSubject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
