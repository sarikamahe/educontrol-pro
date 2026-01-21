import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Search, Calendar, Clock, Upload, Lock, CheckCircle2 } from 'lucide-react';
import { format, addDays, isPast } from 'date-fns';

const mockAssignments = [
  { id: '1', title: 'Linked List Implementation', subject: 'Data Structures', dueDate: addDays(new Date(), 3), status: 'pending', isLocked: false, maxScore: 100 },
  { id: '2', title: 'SQL Query Assignment', subject: 'Database Management', dueDate: addDays(new Date(), 7), status: 'pending', isLocked: true, maxScore: 50 },
  { id: '3', title: 'Binary Tree Traversal', subject: 'Data Structures', dueDate: addDays(new Date(), -2), status: 'submitted', isLocked: false, maxScore: 100 },
  { id: '4', title: 'Regression Analysis', subject: 'Machine Learning', dueDate: addDays(new Date(), 5), status: 'pending', isLocked: false, maxScore: 75 },
  { id: '5', title: 'ER Diagram Design', subject: 'Database Management', dueDate: addDays(new Date(), -5), status: 'graded', isLocked: false, maxScore: 100, score: 85 },
];

const getStatusBadge = (status: string, score?: number, maxScore?: number) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    case 'submitted':
      return <Badge className="bg-blue-500"><Upload className="mr-1 h-3 w-3" />Submitted</Badge>;
    case 'graded':
      return <Badge className="bg-green-500"><CheckCircle2 className="mr-1 h-3 w-3" />{score}/{maxScore}</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export default function Assignments() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
            <p className="text-muted-foreground">View and submit your assignments</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assignments..." className="pl-9" />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {mockAssignments.map((assignment) => (
                <Card key={assignment.id} className={`${assignment.isLocked ? 'opacity-75' : ''}`}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        {assignment.isLocked && <Lock className="h-4 w-4 text-destructive" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                    </div>
                    {getStatusBadge(assignment.status, assignment.score, assignment.maxScore)}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {format(assignment.dueDate, 'MMM dd, yyyy')}</span>
                        </div>
                        <Badge variant="outline">{assignment.maxScore} points</Badge>
                        {isPast(assignment.dueDate) && assignment.status === 'pending' && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        {assignment.status === 'pending' && !assignment.isLocked && (
                          <Button size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Submit
                          </Button>
                        )}
                      </div>
                    </div>
                    {assignment.isLocked && (
                      <p className="text-xs text-destructive mt-3">
                        Submission locked: Attendance below 75%
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid gap-4">
              {mockAssignments.filter(a => a.status === 'pending').map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="submitted">
            <div className="grid gap-4">
              {mockAssignments.filter(a => a.status === 'submitted').map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="graded">
            <div className="grid gap-4">
              {mockAssignments.filter(a => a.status === 'graded').map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{assignment.subject} • Score: {assignment.score}/{assignment.maxScore}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
