import type { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger';

/**
 * The site's button.
 *
 * `.btn` and its variants live in `app/globals.css`, reproduced from
 * `dileepa-dev` rather than approximated in utilities — same height, same
 * hover, same focus ring, same disabled state. A copied string of Tailwind
 * classes cannot stay identical to another repository's CSS; a rule written
 * from the same tokens can.
 *
 * `danger` is the one variant the site does not have. It uses `--error` as its
 * colour, never a new hue.
 */
const variants: Record<Variant, string> = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  danger: 'btn--danger',
};

/** Set while an action is in flight, so a button says "working" in place. */
function Busy({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="spinner" aria-hidden="true" />
      {children}
    </>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  busy = false,
  disabled,
  className,
  ...props
}: ComponentProps<'button'> & {
  children: ReactNode;
  variant?: Variant;
  size?: 'default' | 'compact';
  /** In flight: shows the spinner, announces it, and refuses a second click. */
  busy?: boolean;
}) {
  return (
    <button
      className={cn('btn', variants[variant], size === 'compact' && 'btn--compact', className)}
      // `aria-busy` as well as `disabled`, because the two say different
      // things: disabled is "you cannot do this", busy is "this is happening".
      // A save button mid-save is the second one, and a screen reader that
      // only hears the first has no idea the form was submitted.
      aria-busy={busy || undefined}
      disabled={disabled ?? busy}
      {...props}
    >
      {busy ? <Busy>{children}</Busy> : children}
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
      className={cn('btn', variants[variant], size === 'compact' && 'btn--compact', className)}
    >
      {children}
    </Link>
  );
}
