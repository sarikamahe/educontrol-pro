import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateSubject } from '@/hooks/useSubjects';
import { useBranches } from '@/hooks/useBranches';
import { Loader2 } from 'lucide-react';

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSubjectDialog({ open, onOpenChange }: AddSubjectDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [semester, setSemester] = useState('');
  const [credits, setCredits] = useState('3');
  const [description, setDescription] = useState('');
  
  const createSubject = useCreateSubject();
  const { data: branches } = useBranches();

  const activeBranches = branches?.filter(b => b.is_active) || [];

  const handleBranchToggle = (branchId: string, checked: boolean) => {
    if (checked) {
      setBranchIds(prev => [...prev, branchId]);
    } else {
      setBranchIds(prev => prev.filter(id => id !== branchId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createSubject.mutateAsync({
      name,
      code: code.toUpperCase(),
      branch_ids: branchIds,
      semester: semester ? parseInt(semester) : undefined,
      credits: parseInt(credits) || 3,
      description: description || undefined,
    });
    
    // Reset form
    setName('');
    setCode('');
    setBranchIds([]);
    setSemester('');
    setCredits('3');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name *</Label>
              <Input
                id="subject-name"
                placeholder="e.g., Data Structures"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-code">Subject Code *</Label>
              <Input
                id="subject-code"
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
                      id={`branch-${branch.id}`}
                      checked={branchIds.includes(branch.id)}
                      onCheckedChange={(checked) => handleBranchToggle(branch.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`branch-${branch.id}`}
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
              <Label htmlFor="semester">Semester</Label>
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
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="10"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-description">Description</Label>
            <Textarea
              id="subject-description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSubject.isPending || !name || !code || branchIds.length === 0}>
              {createSubject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Subject
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
