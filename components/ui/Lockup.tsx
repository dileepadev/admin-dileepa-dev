import Link from 'next/link';

/**
 * The brand lockup: `dileepadev /.`
 *
 * The wordmark stays neutral and only the `/.` is emerald. Both classes live in
 * the vendored token sheet; do not reimplement them here.
 */
export function Lockup({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} aria-label="dileepadev admin — dashboard" className="lockup no-underline">
      <span className="wordmark">dileepadev</span>
      <span className="mark" aria-hidden="true">
        /
      </span>
    </Link>
  );
}
