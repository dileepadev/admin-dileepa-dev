'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, DatabaseZap, Eraser } from 'lucide-react';
import { clearDatabase, copyFromSource, type MaintenanceState } from '@/app/actions/maintenance';
import { useToast } from '@/components/providers/toast-provider';
import { Button, Card, EmptyState, FormMessage, Input } from '@/components/ui';
import type { DatabaseStatus } from '@/lib/types';

/**
 * The database screen.
 *
 * Two destructive actions on one page, so the whole design is about making the
 * target unmistakable. The database being emptied is named at the top, named
 * again on each button, and has to be typed out before either button enables.
 * That last one is the same friction `scripts/_common.py` imposes on a
 * production write, for the same reason: a yes/no dialog is answered by reflex,
 * and typing `dev` requires having read the line above it.
 *
 * This screen sends a confirmation string and nothing else. It cannot name a
 * source, a target or a direction — those live in the API's configuration — so
 * there is no argument here that could be the wrong way round.
 */
export function DatabaseScreen({ status }: { status: DatabaseStatus | null }) {
  const toast = useToast();
  const router = useRouter();
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState<MaintenanceState>({});
  const [pending, setPending] = useState(false);

  // `null` means the API served a 404 for these routes, which is what the
  // production API does — they are not registered there. Not an error: it is
  // the feature declining to exist where it would be dangerous.
  if (status === null) {
    return (
      <EmptyState
        title="This API does not offer database maintenance."
        hint="These routes are not registered when the API runs in production, so they cannot be reached from here. Point API_URL at a development API to use this screen."
      />
    );
  }

  const phrase = status.confirmationPhrase;
  const armed = confirm.trim() === phrase && !pending;

  /**
   * Run one of the two actions.
   *
   * Plain state rather than `useTransition`, because the refresh below is not
   * part of the action. A transition stays pending until everything inside it
   * settles, and `router.refresh()` re-renders a layout that was just
   * invalidated wholesale — so the buttons went on spinning long after the
   * copy had finished, which reads as a hung request on the one screen where
   * that is most alarming.
   *
   * So: the button is busy for exactly as long as the API call, and the counts
   * catch up on their own a moment later.
   */
  async function act(action: 'copy' | 'clear') {
    setPending(true);
    const result = action === 'copy' ? await copyFromSource(confirm) : await clearDatabase(confirm);
    setState(result);
    setPending(false);

    toast.push({
      title: result.success
        ? action === 'copy'
          ? 'Copy finished.'
          : 'Database cleared.'
        : 'That did not run.',
      description: result.message,
      type: result.success ? 'success' : 'error',
      duration: result.success ? 8000 : 10000,
    });

    if (result.success) {
      setConfirm('');
      // The counts above came from the server render and now describe a
      // database that no longer exists. `revalidatePath` in the action drops
      // the cache; this is what sends the page back to read it again.
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="db-targets">
          <div>
            <div className="db-label">Reading from</div>
            <p className="db-value">{status.source ?? 'Not configured'}</p>
          </div>
          <div>
            <div className="db-label">Writing to</div>
            {/* The only value on this screen that anything destroys. */}
            <p className="db-value db-value--target">{status.target}</p>
            <p className="db-note">Environment: {status.environment}</p>
          </div>
        </div>

        {status.blockedReason && (
          <div className="db-blocked">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{status.blockedReason}</p>
          </div>
        )}
      </Card>

      <Card>
        <table className="db-table">
          <caption className="sr-only">
            Document counts in each collection, on the source and on the target
          </caption>
          <thead>
            <tr>
              <th scope="col">Collection</th>
              <th scope="col">Source</th>
              <th scope="col">Target</th>
            </tr>
          </thead>
          <tbody>
            {(status.collections ?? []).map((collection) => (
              <tr key={collection.name} data-excluded={!collection.included || undefined}>
                <th scope="row">
                  {collection.name}
                  {!collection.included && <span className="db-skip">never copied</span>}
                </th>
                <td>{collection.source ?? '—'}</td>
                <td>{collection.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(status.excluded ?? []).length > 0 && (
          <p className="db-note mt-4">
            {(status.excluded ?? []).join(', ')} is never copied — it holds the account you are
            signed in as, and replacing it would change your credentials mid-session.
          </p>
        )}
      </Card>

      <Card>
        <label className="db-confirm">
          <span>
            Type <code>{phrase}</code> to enable the actions below
          </span>
          <Input
            name="confirm"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder={phrase}
            autoComplete="off"
            spellCheck={false}
            disabled={pending}
          />
        </label>

        <div className="db-actions">
          <Button
            variant="danger"
            onClick={() => act('copy')}
            disabled={!armed || !status.canCopy}
            busy={pending}
          >
            <DatabaseZap className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Replace {phrase} with a copy of production</span>
          </Button>
          <Button variant="secondary" onClick={() => act('clear')} disabled={!armed} busy={pending}>
            <Eraser className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Empty {phrase}</span>
          </Button>
        </div>

        {state.message && <FormMessage message={state.message} success={state.success} />}

        {state.result && (
          <table className="db-table mt-6">
            <caption className="sr-only">What the last run changed, per collection</caption>
            <thead>
              <tr>
                <th scope="col">Collection</th>
                <th scope="col">Replaced</th>
                <th scope="col">Copied in</th>
              </tr>
            </thead>
            <tbody>
              {(state.result.collections ?? []).map((row) => (
                <tr key={row.name}>
                  <th scope="row">{row.name}</th>
                  <td>{row.removed}</td>
                  <td>{state.result?.action === 'copy' ? row.copied : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
