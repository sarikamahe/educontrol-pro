import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, BarChart3, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl">EduControl Pro</span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Access is Not Given.
          <br />
          <span className="text-primary">It is Earned.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Attendance-enforced education management system. Students must maintain 75% attendance to access resources.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/register">
              Start Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-6 rounded-2xl bg-card border">
            <Shield className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Attendance Control</h3>
            <p className="text-muted-foreground">Auto-lock access when attendance drops below 75%</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border">
            <Users className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Role-Based Access</h3>
            <p className="text-muted-foreground">Super Admin, Teacher, and Student roles with proper permissions</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border">
            <BarChart3 className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Analytics</h3>
            <p className="text-muted-foreground">Track attendance patterns and student performance</p>
          </div>
        </div>
      </main>
    </div>
  );
}
