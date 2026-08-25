import type { ReactNode } from 'react';

/**
 * An empty state says what would appear here and how to make it appear —
 * design system §8. "No results" on its own tells a person nothing.
 */
export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-border-hairline bg-bg-surface rounded-lg border-[0.5px] px-6 py-12 text-center">
      <p className="text-fg">{title}</p>
      {hint && <p className="text-fg-muted text-small mt-2">{hint}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
