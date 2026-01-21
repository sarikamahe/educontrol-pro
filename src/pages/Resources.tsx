import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderOpen, Plus, Search, FileText, Video, File, Download, Lock, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
const mockResources = [
  { id: '1', title: 'Introduction to Data Structures', type: 'pdf', subject: 'Data Structures', size: '2.4 MB', downloads: 45, isLocked: false },
  { id: '2', title: 'Sorting Algorithms Lecture', type: 'video', subject: 'Data Structures', size: '156 MB', downloads: 32, isLocked: false },
  { id: '3', title: 'SQL Query Practice Set', type: 'pdf', subject: 'Database Management', size: '1.2 MB', downloads: 28, isLocked: true },
  { id: '4', title: 'ER Diagram Tutorial', type: 'video', subject: 'Database Management', size: '89 MB', downloads: 41, isLocked: false },
  { id: '5', title: 'Neural Networks Guide', type: 'pdf', subject: 'Machine Learning', size: '4.8 MB', downloads: 56, isLocked: true },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-8 w-8 text-red-500" />;
    case 'video':
      return <Video className="h-8 w-8 text-blue-500" />;
    default:
      return <File className="h-8 w-8 text-muted-foreground" />;
  }
};

export default function Resources() {
  const { isSuperAdmin, isTeacher } = useAuth();
  const canManageResources = isSuperAdmin || isTeacher;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
            <p className="text-muted-foreground">Access course materials, lectures, and documents</p>
          </div>
          {canManageResources && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Resource
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resources..." className="pl-9" />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockResources.map((resource) => (
                <Card key={resource.id} className={`hover:shadow-md transition-shadow ${resource.isLocked ? 'opacity-75' : ''}`}>
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="p-2 bg-muted rounded-lg">
                      {getFileIcon(resource.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{resource.subject}</p>
                    </div>
                    {resource.isLocked && (
                      <Lock className="h-4 w-4 text-destructive" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{resource.size}</span>
                        <span>•</span>
                        <span>{resource.downloads} downloads</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" disabled={resource.isLocked}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" disabled={resource.isLocked}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {resource.isLocked && (
                      <p className="text-xs text-destructive mt-2">
                        Locked: Attendance below 75%
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockResources.filter(r => r.type === 'pdf').map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="p-2 bg-muted rounded-lg">
                      {getFileIcon(resource.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{resource.subject}</p>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockResources.filter(r => r.type === 'video').map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="p-2 bg-muted rounded-lg">
                      {getFileIcon(resource.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{resource.subject}</p>
                    </div>
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
