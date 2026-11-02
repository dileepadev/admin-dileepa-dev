import { cn } from '@/lib/utils';

/**
 * The form-level result line.
 *
 * Errors say what failed and what to do, not "Something went wrong" — the API
 * writes its messages to be read, so they are passed through unchanged.
 */
export function FormMessage({ message, success }: { message?: string; success?: boolean }) {
  if (!message) return null;

  return (
    <p
      role="status"
      className={cn(
        'text-small rounded-tile border px-4 py-3',
        success
          ? 'text-success bg-bg border-transparent'
          : 'border-error/40 text-error bg-transparent',
      )}
    >
      {message}
    </p>
  );
}
