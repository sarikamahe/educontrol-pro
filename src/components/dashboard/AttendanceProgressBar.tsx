import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { AccessStatus } from '@/types/database';

export interface AttendanceProgressBarProps {
  percentage: number;
  accessStatus?: AccessStatus;
  classesAttended?: number;
  totalClasses?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AttendanceProgressBar({
  percentage,
  accessStatus,
  classesAttended,
  totalClasses,
  showLabel = true,
  size = 'md',
  className
}: AttendanceProgressBarProps) {
  const getStatusColor = () => {
    if (accessStatus === 'blocked' || percentage < 65) {
      return 'bg-destructive';
    }
    if (accessStatus === 'at_risk' || percentage < 75) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  };

  const getStatusLabel = () => {
    if (accessStatus === 'blocked' || percentage < 65) {
      return { text: 'Blocked', className: 'text-destructive' };
    }
    if (accessStatus === 'at_risk' || percentage < 75) {
      return { text: 'At Risk', className: 'text-yellow-600' };
    }
    return { text: 'Allowed', className: 'text-green-600' };
  };

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }[size];

  const status = getStatusLabel();

  return (
    <div className={cn('space-y-1.5', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{percentage.toFixed(1)}%</span>
            {classesAttended !== undefined && totalClasses !== undefined && (
              <span className="text-xs text-muted-foreground">
                ({classesAttended}/{totalClasses} classes)
              </span>
            )}
          </div>
          <span className={cn('text-xs font-medium', status.className)}>
            {status.text}
          </span>
        </div>
      )}
      <div className={cn('relative rounded-full bg-secondary overflow-hidden', heightClass)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getStatusColor())}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        {/* 75% threshold line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-foreground/30"
          style={{ left: '75%' }}
        />
      </div>
    </div>
  );
}
