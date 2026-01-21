import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
    subject_branches?: Array<{
      id: string;
      branch_id: string;
      is_active: boolean;
      branches?: { id: string; name: string; code: string };
    }>;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSubjectDialog({ subject, open, onOpenChange }: EditSubjectDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [semester, setSemester] = useState('');
  const [credits, setCredits] = useState('3');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const updateSubject = useUpdateSubject();
  const { data: branches } = useBranches();

  const activeBranches = branches?.filter(b => b.is_active) || [];

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setCode(subject.code);
      setDescription(subject.description || '');
      setSemester(subject.semester?.toString() || '');
      setCredits(subject.credits?.toString() || '3');
      setIsActive(subject.is_active);
      
      // Get branch IDs from junction table or fall back to single branch_id
      if (subject.subject_branches && subject.subject_branches.length > 0) {
        setBranchIds(subject.subject_branches.filter(sb => sb.is_active).map(sb => sb.branch_id));
      } else {
        setBranchIds(subject.branch_id ? [subject.branch_id] : []);
      }
    }
  }, [subject]);

  const handleBranchToggle = (branchId: string, checked: boolean) => {
    if (checked) {
      setBranchIds(prev => [...prev, branchId]);
    } else {
      setBranchIds(prev => prev.filter(id => id !== branchId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;
    
    await updateSubject.mutateAsync({
      id: subject.id,
      name,
      code: code.toUpperCase(),
      branch_ids: branchIds,
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
            <Label>Branches * (select at least one)</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
              {activeBranches.length === 0 ? (
                <p className="col-span-2 text-sm text-muted-foreground">No active branches available</p>
              ) : (
                activeBranches.map((branch) => (
                  <div key={branch.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-branch-${branch.id}`}
                      checked={branchIds.includes(branch.id)}
                      onCheckedChange={(checked) => handleBranchToggle(branch.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`edit-branch-${branch.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {branch.name} ({branch.code})
                    </label>
                  </div>
                ))
              )}
            </div>
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
            <Button type="submit" disabled={updateSubject.isPending || !name || !code || branchIds.length === 0}>
              {updateSubject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
