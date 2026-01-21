import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useBranches } from '@/hooks/useBranches';
import { useSubjects } from '@/hooks/useSubjects';
import { useUploadResource } from '@/hooks/useResources';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Upload, File, X } from 'lucide-react';

interface UploadResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadResourceDialog({ open, onOpenChange }: UploadResourceDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<'notes' | 'recording' | 'guidance' | 'other'>('notes');
  const [branchId, setBranchId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [isAttendanceRequired, setIsAttendanceRequired] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user, profile, isTeacher, isSuperAdmin } = useAuth();
  const { data: branches } = useBranches();
  const { data: subjects } = useSubjects();
  const uploadResource = useUploadResource();

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
    if (!file || !subjectId || !user) return;
    
    await uploadResource.mutateAsync({
      file,
      title,
      description: description || undefined,
      subjectId,
      resourceType,
      uploadedBy: user.id,
      isAttendanceRequired,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setResourceType('notes');
    setBranchId('');
    setSubjectId('');
    setFile(null);
    setIsAttendanceRequired(true);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource-title">Title *</Label>
            <Input
              id="resource-title"
              placeholder="e.g., Chapter 1 Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-type">Resource Type *</Label>
            <Select value={resourceType} onValueChange={(v) => setResourceType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notes">Notes</SelectItem>
                <SelectItem value="recording">Recording</SelectItem>
                <SelectItem value="guidance">Guidance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="resource-branch">Branch *</Label>
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
            <Label htmlFor="resource-subject">Subject *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="resource-description">Description</Label>
            <Textarea
              id="resource-description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>File *</Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <File className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
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
                className="w-full h-20 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Click to upload file
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="attendance-required">Require 75% Attendance</Label>
              <p className="text-xs text-muted-foreground">Students need minimum attendance to access</p>
            </div>
            <Switch
              id="attendance-required"
              checked={isAttendanceRequired}
              onCheckedChange={setIsAttendanceRequired}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploadResource.isPending || !title || !file || !subjectId}>
              {uploadResource.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload Resource
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
