import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, UserPlus, X, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Branch } from '@/types/database';

interface BranchUsersDialogProps {
  branch: Branch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  branch_id: string | null;
  role: string;
}

export function BranchUsersDialog({ branch, open, onOpenChange }: BranchUsersDialogProps) {
  const [branchUsers, setBranchUsers] = useState<UserWithRole[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<UserWithRole[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open && branch) {
      fetchUsers();
    }
  }, [open, branch]);

  const fetchUsers = async () => {
    if (!branch) return;
    setLoading(true);
    
    try {
      // Fetch all users with their roles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, branch_id')
        .eq('is_active', true);
      
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      const usersWithRoles = (profiles || []).map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.id)?.role || 'student'
      }));

      setBranchUsers(usersWithRoles.filter(u => u.branch_id === branch.id));
      setUnassignedUsers(usersWithRoles.filter(u => !u.branch_id));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignUser = async () => {
    if (!selectedUser || !branch) return;
    setAssigning(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ branch_id: branch.id })
        .eq('id', selectedUser);
      
      if (error) throw error;
      
      toast.success('User assigned to branch');
      setSelectedUser('');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to assign user');
    } finally {
      setAssigning(false);
    }
  };

  const removeUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ branch_id: null })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success('User removed from branch');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'teacher': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Users - {branch?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add User Section */}
          <div className="flex gap-2">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select an unassigned user..." />
              </SelectTrigger>
              <SelectContent>
                {unassignedUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email} ({user.role})
                  </SelectItem>
                ))}
                {unassignedUsers.length === 0 && (
                  <SelectItem value="_none" disabled>No unassigned users</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button onClick={assignUser} disabled={!selectedUser || assigning}>
              {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Current Users */}
          <div className="border rounded-lg">
            <div className="p-3 border-b bg-muted/50">
              <h3 className="font-medium text-sm">Users in this branch ({branchUsers.length})</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : branchUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No users assigned to this branch
                </div>
              ) : (
                <div className="divide-y">
                  {branchUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                          {user.role.replace('_', ' ')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeUser(user.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
