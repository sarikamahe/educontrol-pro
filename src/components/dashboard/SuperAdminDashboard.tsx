import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserPlus,
  Settings,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Branch } from '@/types/database';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalSubjects: 0
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch branches
      const { data: branchesData } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true);
      
      if (branchesData) {
        setBranches(branchesData as Branch[]);
        setStats(prev => ({ ...prev, totalBranches: branchesData.length }));
      }

      // Fetch subjects count
      const { count: subjectsCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });
      
      if (subjectsCount !== null) {
        setStats(prev => ({ ...prev, totalSubjects: subjectsCount }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your institution's branches, users, and settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/users">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Branches"
          value={stats.totalBranches}
          description="Active departments"
          icon={Building2}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatsCard
          title="Total Teachers"
          value={stats.totalTeachers}
          description="Registered faculty"
          icon={Users}
          iconClassName="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          description="Enrolled students"
          icon={GraduationCap}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatsCard
          title="Total Subjects"
          value={stats.totalSubjects}
          description="Across all branches"
          icon={BookOpen}
          iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
      </div>

      {/* Branches Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Branches Overview</CardTitle>
            <CardDescription>
              All engineering departments in your institution
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/branches">
              Manage Branches
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {branches.map((branch) => (
              <Card key={branch.id} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                      {branch.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{branch.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {branch.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">User Management</h3>
                <p className="text-sm text-muted-foreground">Add teachers and manage roles</p>
              </div>
              <Button size="sm" variant="secondary" asChild>
                <Link to="/users">Go</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">View attendance reports</p>
              </div>
              <Button size="sm" variant="secondary" asChild>
                <Link to="/analytics">Go</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-white">
                <Settings className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Settings</h3>
                <p className="text-sm text-muted-foreground">Configure system preferences</p>
              </div>
              <Button size="sm" variant="secondary" asChild>
                <Link to="/settings">Go</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
