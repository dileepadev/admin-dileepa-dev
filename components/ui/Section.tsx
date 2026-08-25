import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('py-8 sm:py-10', className)}>{children}</section>;
}

/**
 * A mono `--brand` label, an H1, and an intro in `--fg-muted`.
 *
 * The label carries the accent and the heading stays `--fg`, exactly as on the
 * public site — design system §6. `actions` is where a screen's primary button
 * goes, so every screen puts it in the same place.
 *
 * `count` sits beside the title rather than above the table, because "how many
 * are there" is part of the heading of a list and putting it anywhere else
 * makes it a second thing to find.
 */
export function SectionHeading({
  label,
  title,
  intro,
  count,
  actions,
}: {
  label: string;
  title: string;
  intro?: string;
  count?: number;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-brand text-label font-mono tracking-[0.06em] uppercase">{label}</p>
        <h1 className="text-fg text-h1 mt-1.5 flex items-baseline gap-3 font-bold tracking-[-0.02em]">
          {title}
          {count !== undefined && (
            <span className="text-fg-muted text-small font-mono font-normal">{count}</span>
          )}
        </h1>
        {intro && (
          <p className="text-fg-muted text-small mt-2 max-w-[68ch] leading-relaxed">{intro}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-none flex-wrap items-center gap-3 pt-0.5 sm:self-start">
          {actions}
        </div>
      )}
    </div>
  );
}
