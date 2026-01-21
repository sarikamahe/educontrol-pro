import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, Lock } from 'lucide-react';
import type { AccessStatus } from '@/types/database';

interface AccessStatusBadgeProps {
  status: AccessStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  allowed: {
    label: 'Access Allowed',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
  },
  at_risk: {
    label: 'At Risk',
    icon: AlertTriangle,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
  },
  blocked: {
    label: 'Access Blocked',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
  }
};

export function AccessStatusBadge({
  status,
  showIcon = true,
  size = 'md',
  className
}: AccessStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn('mr-1.5', iconSizes[size])} />}
      {config.label}
    </Badge>
  );
}

interface LockedOverlayProps {
  message?: string;
  className?: string;
}

export function LockedOverlay({ message = 'Access blocked due to low attendance', className }: LockedOverlayProps) {
  return (
    <div className={cn(
      'absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg',
      className
    )}>
      <div className="flex flex-col items-center gap-3 text-center p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <Lock className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Content Locked</h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-1">{message}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Maintain 75% attendance to unlock
        </p>
      </div>
    </div>
  );
}
