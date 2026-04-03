import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-pure border border-surface-cool rounded-lg shadow-md',
        onClick && 'cursor-pointer hover:shadow-lg transition-shadow',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
