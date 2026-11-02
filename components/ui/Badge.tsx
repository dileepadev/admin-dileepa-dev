import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * One treatment for every badge.
 *
 * With a single accent colour, badges are told apart by their label, not by
 * hue — design system §6. `filled` is the one filled variant and is reserved:
 * at most one per view.
 */
export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode;
  variant?: 'default' | 'filled' | 'error';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'text-label rounded-pill inline-block border border-transparent px-3 py-1 font-medium tracking-[0.01em] whitespace-nowrap',
        variant === 'filled' && 'bg-brand-fill text-on-brand border-transparent',
        variant === 'error' && 'text-error bg-bg',
        variant === 'default' && 'bg-bg-surface text-fg-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Whether a record is on the public site.
 *
 * "Live" and "Hidden" rather than "Published" and "Draft": the question a
 * person is actually asking is whether a visitor can see it.
 */
export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <Badge className={published ? 'text-fg' : undefined}>{published ? 'Live' : 'Hidden'}</Badge>
  );
}
