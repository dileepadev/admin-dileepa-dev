import { ServerOff } from 'lucide-react';

/**
 * Shown on every screen when the API did not answer.
 *
 * This is the other half of `readList` in `lib/crud.ts`. Degrading a failed
 * read to an empty list is only honest if the failure is stated somewhere —
 * otherwise "the API is down" renders as "you have no projects", and the empty
 * state helpfully explains how to publish one, which is advice for a problem
 * the person does not have.
 *
 * Deliberately not a toast: a toast is for something that just happened, and
 * this is a condition that persists until it is fixed.
 */
export function ApiOfflineBanner({ apiHost }: { apiHost: string }) {
  return (
    <div role="status" className="api-offline">
      <ServerOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <p>
        <strong>{apiHost} is not answering.</strong> Screens below may show nothing where there is
        data, and saving will fail. Check that the API is running and that <code>API_URL</code>{' '}
        points at it.
      </p>
    </div>
  );
}
