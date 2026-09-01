import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** `--bg-surface`, hairline border, `--radius-lg`, `--space-6`. Design system §6. */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('border-border-strong bg-bg-surface rounded-lg border p-6', className)}>
      {children}
    </div>
  );
}
