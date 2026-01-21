import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpen, Plus, Search, Clock, Loader2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuth } from '@/contexts/AuthContext';
import { AddSubjectDialog } from '@/components/subjects/AddSubjectDialog';
import { EditSubjectDialog } from '@/components/subjects/EditSubjectDialog';
import { DeleteSubjectDialog } from '@/components/subjects/DeleteSubjectDialog';

export default function Subjects() {
  const { data: subjects, isLoading } = useSubjects();
  const { isSuperAdmin, isTeacher, profile } = useAuth();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<any>(null);
  const [deleteSubject, setDeleteSubject] = useState<any>(null);

  const canManageSubjects = isSuperAdmin || isTeacher;

  // Helper function to get branch IDs from a subject
  const getSubjectBranchIds = (subject: any): string[] => {
    if (subject.subject_branches && subject.subject_branches.length > 0) {
      return subject.subject_branches
        .filter((sb: any) => sb.is_active)
        .map((sb: any) => sb.branch_id);
    }
    // Fall back to single branch_id
    return subject.branch_id ? [subject.branch_id] : [];
  };

  // Filter subjects - teachers see subjects that include their branch
  const filteredSubjects = subjects?.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    
    if (isTeacher && profile?.branch_id) {
      const subjectBranchIds = getSubjectBranchIds(s);
      return matchesSearch && subjectBranchIds.includes(profile.branch_id);
    }
    return matchesSearch;
  }) || [];

  // Helper to render branch badges
  const renderBranchBadges = (subject: any) => {
    if (subject.subject_branches && subject.subject_branches.length > 0) {
      const activeBranches = subject.subject_branches.filter((sb: any) => sb.is_active && sb.branches);
      if (activeBranches.length === 0) {
        return <span className="text-muted-foreground">No Branch</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {activeBranches.map((sb: any) => (
            <Badge key={sb.id} variant="outline" className="text-xs">
              {sb.branches?.code || 'Unknown'}
            </Badge>
          ))}
        </div>
      );
    }
    // Fall back to single branch display
    return <span>{(subject.branches as any)?.name || 'No Branch'}</span>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
            <p className="text-muted-foreground">Manage academic subjects and courses</p>
          </div>
          {canManageSubjects && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search subjects..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{subject.code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={subject.is_active ? 'default' : 'secondary'}>
                      {subject.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {canManageSubjects && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditSubject(subject)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteSubject(subject)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      {renderBranchBadges(subject)}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Semester {subject.semester || '-'}</span>
                    </div>
                    <Badge variant="outline">{subject.credits} Credits</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredSubjects.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No subjects found
              </div>
            )}
          </div>
        )}
      </div>
      
      <AddSubjectDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditSubjectDialog 
        subject={editSubject} 
        open={!!editSubject} 
        onOpenChange={(open) => !open && setEditSubject(null)} 
      />
      <DeleteSubjectDialog 
        subject={deleteSubject} 
        open={!!deleteSubject} 
        onOpenChange={(open) => !open && setDeleteSubject(null)} 
      />
    </DashboardLayout>
  );
}
