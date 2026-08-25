import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('py-10', className)}>{children}</section>;
}

/**
 * A mono `--brand` label, an H1, and an intro in `--fg-muted`.
 *
 * The label carries the accent and the heading stays `--fg`, exactly as on the
 * public site — design system §6. `actions` is where a screen's primary button
 * goes, so every screen puts it in the same place.
 */
export function SectionHeading({
  label,
  title,
  intro,
  actions,
}: {
  label: string;
  title: string;
  intro?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-brand text-small font-mono leading-none">{label}</p>
        <h1 className="text-fg text-h1 mt-3 font-bold tracking-[-0.02em]">{title}</h1>
        {intro && <p className="text-fg-muted text-small mt-3 max-w-[68ch]">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
