import type { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger';

const base =
  'inline-flex items-center justify-center gap-2 rounded border-[0.5px] px-6 py-3 ' +
  'font-sans text-small font-medium leading-none no-underline ' +
  'transition-colors duration-[160ms] ease-brand ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<Variant, string> = {
  // Primary darkens its fill on hover — never a glow. Design system §6.
  primary: 'border-transparent bg-brand-fill text-on-brand hover:brightness-90',
  secondary: 'border-border-hairline bg-transparent text-fg hover:bg-bg-surface',
  // Destructive uses --error as the fill, never a new hue.
  danger: 'border-transparent bg-error text-white hover:brightness-90',
};

/** A compact variant for the action column of a table row. */
const compact = 'px-3 py-2';

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  className,
  ...props
}: ComponentProps<'button'> & {
  children: ReactNode;
  variant?: Variant;
  size?: 'default' | 'compact';
}) {
  return (
    <button
      className={cn(base, variants[variant], size === 'compact' && compact, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = 'secondary',
  size = 'default',
  className,
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  size?: 'default' | 'compact';
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], size === 'compact' && compact, className)}
    >
      {children}
    </Link>
  );
}
