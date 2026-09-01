import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The admin's measure.
 *
 * Wider than the public site's 760px, deliberately: this is a working surface
 * with tables and two-column forms, not a page to read.
 */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
  );
}
