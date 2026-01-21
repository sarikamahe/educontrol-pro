import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderOpen, Plus, Search, FileText, Video, File, Download, Lock, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useResources } from '@/hooks/useResources';
import { UploadResourceDialog } from '@/components/resources/UploadResourceDialog';

const getFileIcon = (type: string) => {
  switch (type) {
    case 'notes':
      return <FileText className="h-8 w-8 text-red-500" />;
    case 'recording':
      return <Video className="h-8 w-8 text-blue-500" />;
    default:
      return <File className="h-8 w-8 text-muted-foreground" />;
  }
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function Resources() {
  const { isSuperAdmin, isTeacher } = useAuth();
  const canManageResources = isSuperAdmin || isTeacher;
  const { data: resources, isLoading } = useResources();
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  const filteredResources = resources?.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.subjects?.name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const documentResources = filteredResources.filter(r => r.resource_type === 'notes' || r.resource_type === 'guidance');
  const videoResources = filteredResources.filter(r => r.resource_type === 'recording');

  const handleDownload = async (fileUrl: string, fileName: string) => {
    window.open(fileUrl, '_blank');
  };

  const renderResourceCard = (resource: any, showLocked = true) => {
    const isLocked = resource.is_attendance_required && !canManageResources;
    
    return (
      <Card key={resource.id} className={`hover:shadow-md transition-shadow ${isLocked ? 'opacity-75' : ''}`}>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="p-2 bg-muted rounded-lg">
            {getFileIcon(resource.resource_type)}
          </div>
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{resource.subjects?.name || 'Unknown Subject'}</p>
          </div>
          {isLocked && showLocked && (
            <Lock className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{formatFileSize(resource.file_size)}</span>
              <Badge variant="outline" className="text-xs">{resource.resource_type}</Badge>
            </div>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                disabled={isLocked}
                onClick={() => resource.file_url && handleDownload(resource.file_url, resource.file_name || 'download')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                disabled={isLocked}
                onClick={() => resource.file_url && handleDownload(resource.file_url, resource.file_name || 'download')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {isLocked && showLocked && (
            <p className="text-xs text-destructive mt-2">
              Locked: Attendance below 75%
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
            <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
            <p className="text-muted-foreground">Access course materials, lectures, and documents</p>
          </div>
          {canManageResources && (
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Resource
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search resources..." 
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
              <TabsTrigger value="all">All Resources ({filteredResources.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({documentResources.length})</TabsTrigger>
              <TabsTrigger value="videos">Videos ({videoResources.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredResources.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No resources found</p>
                    {canManageResources && (
                      <Button variant="outline" className="mt-4" onClick={() => setUploadOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Upload your first resource
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredResources.map((resource) => renderResourceCard(resource))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents">
              {documentResources.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documentResources.map((resource) => renderResourceCard(resource))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos">
              {videoResources.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No videos found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {videoResources.map((resource) => renderResourceCard(resource))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Upload Dialog */}
      <UploadResourceDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </DashboardLayout>
  );
}
