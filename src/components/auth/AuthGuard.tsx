import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import type { AppRole } from '@/types/database';
import { Loader2 } from 'lucide-react';

export interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  requiredRoles?: AppRole[];
  redirectTo?: string;
}

export function AuthGuard({ children, allowedRoles, requiredRoles, redirectTo = '/login' }: AuthGuardProps) {
  // Support both prop names for flexibility
  const rolesToCheck = requiredRoles || allowedRoles;
  const { user, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (rolesToCheck && rolesToCheck.length > 0) {
    const hasAllowedRole = rolesToCheck.some(role => roles.includes(role));
    if (!hasAllowedRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
