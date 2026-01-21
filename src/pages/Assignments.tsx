import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Search, Calendar, Clock, Upload, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useAssignments } from '@/hooks/useAssignments';
import { CreateAssignmentDialog } from '@/components/assignments/CreateAssignmentDialog';

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
  const { isSuperAdmin, isTeacher, isStudent } = useAuth();
  const canManageAssignments = isSuperAdmin || isTeacher;
  const { data: assignments, isLoading } = useAssignments();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const filteredAssignments = assignments?.filter(a =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.subjects?.name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const pendingAssignments = filteredAssignments.filter(a => isPast(new Date(a.due_date)) === false);
  const pastDueAssignments = filteredAssignments.filter(a => isPast(new Date(a.due_date)));

  const renderAssignmentCard = (assignment: any) => {
    const dueDate = new Date(assignment.due_date);
    const isOverdue = isPast(dueDate);
    const isLocked = assignment.is_attendance_required && isStudent;

    return (
      <Card key={assignment.id} className={`${isLocked ? 'opacity-75' : ''}`}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
              {isLocked && <Lock className="h-4 w-4 text-destructive" />}
            </div>
            <p className="text-sm text-muted-foreground">{assignment.subjects?.name || 'Unknown Subject'}</p>
          </div>
          {getStatusBadge('pending', undefined, assignment.max_score)}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due: {format(dueDate, 'MMM dd, yyyy')}</span>
              </div>
              <Badge variant="outline">{assignment.max_score} points</Badge>
              {isOverdue && (
                <Badge variant="destructive">Overdue</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">View Details</Button>
              {isStudent && !isLocked && !isOverdue && (
                <Button size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Submit
                </Button>
              )}
            </div>
          </div>
          {isLocked && (
            <p className="text-xs text-destructive mt-3">
              Submission locked: Attendance below 75%
            </p>
          )}
          {assignment.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {assignment.description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
            <p className="text-muted-foreground">View and submit your assignments</p>
          </div>
          {canManageAssignments && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search assignments..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({filteredAssignments.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
              <TabsTrigger value="past">Past Due ({pastDueAssignments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredAssignments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No assignments found</p>
                    {canManageAssignments && (
                      <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first assignment
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredAssignments.map(renderAssignmentCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingAssignments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending assignments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pendingAssignments.map(renderAssignmentCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastDueAssignments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No past due assignments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pastDueAssignments.map(renderAssignmentCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Create Dialog */}
      <CreateAssignmentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </DashboardLayout>
  );
}
