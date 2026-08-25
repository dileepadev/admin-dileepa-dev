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
        'text-small rounded border-[0.5px] px-4 py-3',
        success
          ? 'border-brand/40 text-brand bg-transparent'
          : 'border-error/40 text-error bg-transparent',
      )}
    >
      {message}
    </p>
  );
}
