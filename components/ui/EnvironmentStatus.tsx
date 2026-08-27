import { AlertTriangle, ServerOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Connection } from '@/lib/types';

/**
 * Which deployment this session is talking to, and which database it holds.
 *
 * Exists because the two databases converge on request (see the Database
 * screen) — after a copy, development and production can carry identical
 * content, and the one thing that still tells them apart is which connection
 * this session is actually using. That has to be visible on every screen, not
 * only on Database, which is why this lives in the header rather than there.
 *
 * `<details>` rather than a tooltip or a modal — the same choice
 * `ApiEndpoints` makes, and for the same reason: it answers a question a
 * person has occasionally, not one they have while working, and needs no
 * JavaScript to do it.
 *
 * It reports two independent things, because neither implies the other: which
 * API answered (and so which database is being edited), and whether this admin
 * is a local dev server. `next dev` pointed at the deployed API is editing
 * production while every other signal on the machine says "local".
 *
 * A `partial` connection is an API older than this admin — it has no `/status`
 * yet, so the environment comes from the public `/version` and the rows that
 * only `/status` carries read "Unknown". It is deliberately not styled as a
 * problem: every other screen is reading from that same API perfectly well,
 * and dressing it up as a failure would contradict what the user can see.
 *
 * `--warning` marks production, not `--error` and not a new hue: this is a
 * state worth noticing, not a failure. `--error` is reserved for the one
 * thing here that actually is a failure — the API not answering at all.
 */
export function EnvironmentStatus({
  connection,
  apiHost,
  local,
}: {
  connection: Connection;
  apiHost: string;
  /** Whether this admin is a local dev server rather than the deployment. */
  local: boolean;
}) {
  if (connection.state === 'unreachable') {
    return (
      <div className="env-status env-status--error" title={`Could not reach ${apiHost}`}>
        <ServerOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>API unreachable</span>
      </div>
    );
  }

  // Narrowed on the tag in one place, so the rest of the component reads the
  // same fields whichever shape answered.
  const { environment, version, full } =
    connection.state === 'ok'
      ? {
          environment: connection.status.environment,
          version: connection.status.version,
          full: connection.status,
        }
      : { environment: connection.environment, version: connection.version, full: null };

  const production = environment === 'production';

  // The combination worth calling out by name. Running the admin locally says
  // nothing about which database it edits — that is decided entirely by
  // API_URL — so a local dev server pointed at the deployed API looks and
  // feels like a scratch environment while writing to the live one. Neither
  // half is visible from the other: the terminal shows localhost, the data
  // shows real content.
  const localToProduction = production && local;

  return (
    <details className="env-status-details">
      <summary className={cn('env-status', production && 'env-status--warning')}>
        {production && <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        <span className="env-status-env">{environment}</span>
        <span className="env-status-host hidden sm:inline">{apiHost}</span>
      </summary>

      <div className="env-status-body">
        <dl>
          <div>
            <dt>API</dt>
            <dd>{apiHost}</dd>
          </div>
          <div>
            <dt>Environment</dt>
            <dd className={production ? 'text-warning' : undefined}>{environment}</dd>
          </div>
          <div>
            <dt>Database</dt>
            <dd>{full ? full.database : 'Unknown'}</dd>
          </div>
          <div>
            <dt>Admin</dt>
            <dd className={localToProduction ? 'text-warning' : undefined}>
              {local ? 'Local dev server' : 'Deployed'}
            </dd>
          </div>
          <div>
            <dt>API version</dt>
            <dd>{version}</dd>
          </div>
          {full && (
            <>
              <div>
                <dt>Docs</dt>
                <dd>{full.docsEnabled ? 'Enabled' : 'Disabled'}</dd>
              </div>
              <div>
                <dt>Maintenance screen</dt>
                <dd>{full.maintenanceAvailable ? 'Available' : 'Not on this deployment'}</dd>
              </div>
            </>
          )}
        </dl>

        {production && (
          <p className="env-status-warning">
            {localToProduction
              ? 'This admin is running locally, but it is writing to production. Every save here is live on dileepa.dev. Point API_URL at http://localhost:8000 to work against the development database instead.'
              : 'This session writes to production. Every save here is live on dileepa.dev.'}
          </p>
        )}

        {!full && (
          <p className="env-status-note">
            This API has no <code>/status</code> yet, so the database and maintenance rows are
            unknown. Everything else works normally — deploy the API to fill them in.
          </p>
        )}
      </div>
    </details>
  );
}
