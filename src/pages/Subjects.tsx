import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Search, Users, Clock } from 'lucide-react';

const mockSubjects = [
  { id: '1', name: 'Data Structures', code: 'CS201', branch: 'Computer Science', semester: 3, credits: 4, students: 45, isActive: true },
  { id: '2', name: 'Database Management', code: 'CS301', branch: 'Computer Science', semester: 5, credits: 3, students: 38, isActive: true },
  { id: '3', name: 'Thermodynamics', code: 'ME202', branch: 'Mechanical', semester: 3, credits: 4, students: 52, isActive: true },
  { id: '4', name: 'Circuit Analysis', code: 'EE101', branch: 'Electrical', semester: 1, credits: 3, students: 60, isActive: false },
  { id: '5', name: 'Machine Learning', code: 'CS401', branch: 'Computer Science', semester: 7, credits: 4, students: 32, isActive: true },
];

export default function Subjects() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
            <p className="text-muted-foreground">Manage academic subjects and courses</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search subjects..." className="pl-9" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockSubjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{subject.code}</p>
                </div>
                <Badge variant={subject.isActive ? 'default' : 'secondary'}>
                  {subject.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{subject.branch}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Semester {subject.semester}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{subject.students} enrolled</span>
                    </div>
                  </div>
                  <Badge variant="outline">{subject.credits} Credits</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
