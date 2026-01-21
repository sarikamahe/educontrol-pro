import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUpdateUserRole } from '@/hooks/useUsers';
import { Loader2, Shield, GraduationCap, Users } from 'lucide-react';
import type { UserWithRole } from '@/hooks/useUsers';
import type { AppRole } from '@/types/database';

interface ChangeRoleDialogProps {
  user: UserWithRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeRoleDialog({ user, open, onOpenChange }: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<AppRole>('student');
  const updateRole = useUpdateUserRole();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    await updateRole.mutateAsync({ userId: user.id, role: selectedRole });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Changing role for: <strong>{user?.full_name || user?.email}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Current role: {user?.roles.join(', ')}
            </p>
          </div>

          <RadioGroup value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span>Student</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Can view resources, submit assignments, check attendance
                  </p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="teacher" id="teacher" />
                <Label htmlFor="teacher" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>Teacher</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Can manage subjects, mark attendance, upload resources
                  </p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="super_admin" id="super_admin" />
                <Label htmlFor="super_admin" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span>Super Admin</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Full access to all features and settings
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateRole.isPending}>
              {updateRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
