import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** A borderless tile one surface step below its panel. Design system §6. */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('admin-card', className)}>{children}</div>;
}
