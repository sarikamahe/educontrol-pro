import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Users, BookOpen } from 'lucide-react';

const mockBranches = [
  { id: '1', name: 'Computer Science', code: 'CS', students: 120, subjects: 8, isActive: true },
  { id: '2', name: 'Mechanical Engineering', code: 'ME', students: 95, subjects: 7, isActive: true },
  { id: '3', name: 'Electrical Engineering', code: 'EE', students: 88, subjects: 6, isActive: true },
  { id: '4', name: 'Civil Engineering', code: 'CE', students: 72, subjects: 5, isActive: false },
];

export default function Branches() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
            <p className="text-muted-foreground">Manage academic branches and departments</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Branch
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockBranches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">{branch.name}</CardTitle>
                <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Building2 className="h-4 w-4" />
                  <span>Code: {branch.code}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{branch.students} Students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{branch.subjects} Subjects</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
