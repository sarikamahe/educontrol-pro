import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Shield, GraduationCap, Users as UsersIcon, Loader2, Pencil, UserCog, Trash2 } from 'lucide-react';
import { useUsers, UserWithRole } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { EditUserDialog } from '@/components/users/EditUserDialog';
import { ChangeRoleDialog } from '@/components/users/ChangeRoleDialog';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';

const getRoleBadge = (roles: string[]) => {
  if (roles.includes('super_admin')) {
    return <Badge variant="destructive"><Shield className="mr-1 h-3 w-3" />Super Admin</Badge>;
  }
  if (roles.includes('teacher')) {
    return <Badge variant="default"><GraduationCap className="mr-1 h-3 w-3" />Teacher</Badge>;
  }
  return <Badge variant="secondary"><UsersIcon className="mr-1 h-3 w-3" />Student</Badge>;
};

export default function Users() {
  const { data: users, isLoading } = useUsers();
  const [search, setSearch] = useState('');
  const { isSuperAdmin, user: currentUser } = useAuth();
  
  // Dialog states
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [roleUser, setRoleUser] = useState<UserWithRole | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserWithRole | null>(null);

  const filteredUsers = users?.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage users, roles, and permissions</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-9" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    {isSuperAdmin && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.roles)}</TableCell>
                      <TableCell>{user.branch?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'outline' : 'secondary'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditUser(user)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRoleUser(user)}>
                                <UserCog className="mr-2 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              {user.id !== currentUser?.id && (
                                <DropdownMenuItem 
                                  onClick={() => setDeleteUser(user)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EditUserDialog 
        user={editUser} 
        open={!!editUser} 
        onOpenChange={(open) => !open && setEditUser(null)} 
      />
      <ChangeRoleDialog 
        user={roleUser} 
        open={!!roleUser} 
        onOpenChange={(open) => !open && setRoleUser(null)} 
      />
      <DeleteUserDialog 
        user={deleteUser} 
        open={!!deleteUser} 
        onOpenChange={(open) => !open && setDeleteUser(null)} 
      />
    </DashboardLayout>
  );
}
