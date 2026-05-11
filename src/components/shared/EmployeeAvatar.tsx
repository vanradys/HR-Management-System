import { getInitials, getAvatarColor } from '@/utils/helpers';
import { cn } from '@/lib/utils';

interface EmployeeAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EmployeeAvatar({ name, size = 'md', className }: EmployeeAvatarProps) {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0',
        colorClass,
        sizeClasses[size],
        className
      )}
      data-testid={`avatar-${name}`}
      title={name}
    >
      {initials}
    </div>
  );
}
