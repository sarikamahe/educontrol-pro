import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Building2, Plus, Users, BookOpen, Loader2, MoreVertical, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useBranchStats, useDeleteBranch } from '@/hooks/useBranches';
import { AddBranchDialog } from '@/components/branches/AddBranchDialog';
import { EditBranchDialog } from '@/components/branches/EditBranchDialog';
import { DeleteBranchDialog } from '@/components/branches/DeleteBranchDialog';
import { BranchUsersDialog } from '@/components/branches/BranchUsersDialog';
import type { Branch } from '@/types/database';

export default function Branches() {
  const { data: branches, isLoading } = useBranchStats();
  const [addOpen, setAddOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [deleteBranch, setDeleteBranch] = useState<Branch | null>(null);
  const [manageBranch, setManageBranch] = useState<Branch | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
            <p className="text-muted-foreground">Manage academic branches and departments</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Branch
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : branches?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No branches found</p>
              <Button variant="outline" className="mt-4" onClick={() => setAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add your first branch
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {branches?.map((branch) => (
              <Card key={branch.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">{branch.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={branch.is_active ? 'default' : 'secondary'}>
                      {branch.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditBranch(branch)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Branch
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setManageBranch(branch)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Manage Users
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteBranch(branch)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Branch
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Building2 className="h-4 w-4" />
                    <span>Code: {branch.code}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{branch.studentCount} Students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>{branch.subjectCount} Subjects</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddBranchDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditBranchDialog 
        branch={editBranch} 
        open={!!editBranch} 
        onOpenChange={(open) => !open && setEditBranch(null)} 
      />
      <DeleteBranchDialog 
        branch={deleteBranch} 
        open={!!deleteBranch} 
        onOpenChange={(open) => !open && setDeleteBranch(null)} 
      />
      <BranchUsersDialog 
        branch={manageBranch} 
        open={!!manageBranch} 
        onOpenChange={(open) => !open && setManageBranch(null)} 
      />
    </DashboardLayout>
  );
}
