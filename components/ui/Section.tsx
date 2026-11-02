import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('admin-section', className)}>{children}</section>;
}

/** A path capsule, a medium-weight title, its count and optional actions. */
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
        <nav className="admin-path" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{label}</span>
        </nav>
        <h1 className="text-fg text-h1 flex flex-wrap items-baseline gap-3 font-medium tracking-[-0.04em]">
          {title}
          {count !== undefined && <span className="admin-count">{count}</span>}
        </h1>
        {intro && (
          <p className="text-fg-body text-small mt-3 max-w-[68ch] leading-relaxed">{intro}</p>
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
