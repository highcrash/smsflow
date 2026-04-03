import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        green: 'bg-brand-50 text-brand-700',
        dark: 'bg-dark-800 text-white',
        gray: 'bg-surface-warm text-dark-600',
        warning: 'bg-amber-50 text-amber-800',
        error: 'bg-red-50 text-red-800',
        info: 'bg-blue-50 text-blue-800',
      },
    },
    defaultVariants: {
      variant: 'gray',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
