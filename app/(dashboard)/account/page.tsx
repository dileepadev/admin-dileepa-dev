import type { Metadata } from 'next';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { getProfile, getSessionInfo } from '@/app/actions/account';
import { getSystemStatus } from '@/app/actions/maintenance';
import { apiHost } from '@/lib/api';
import { Badge, Card, EmptyState, Section, SectionHeading } from '@/components/ui';
import { LocalTime, SessionCountdown } from './session-countdown';

export const metadata: Metadata = { title: 'Account' };

// The countdown is anchored to a timestamp, but the timestamp itself has to be
// current: a cached render would hand a stale expiry to a fresh visit.
export const dynamic = 'force-dynamic';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="account-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default async function AccountPage() {
  const [profile, session, connection] = await Promise.all([
    getProfile(),
    getSessionInfo(),
    getSystemStatus(),
  ]);

  const environment =
    connection.state === 'unreachable'
      ? null
      : connection.state === 'ok'
        ? connection.status.environment
        : connection.environment;
  const version =
    connection.state === 'unreachable'
      ? null
      : connection.state === 'ok'
        ? connection.status.version
        : connection.version;

  // The two sources can disagree, and that is the interesting case: the token
  // says what was true at sign-in, the profile says what is true now.
  const rolesDiffer =
    profile !== null &&
    session !== null &&
    [...(profile.roles ?? [])].sort().join(',') !== [...session.roles].sort().join(',');

  return (
    <Section>
      <SectionHeading
        label="Account"
        title="Who you are signed in as, and for how long"
        intro="The account is read from the API, so it is current. The session is read from the token in your cookie, so it is a snapshot of what was true when you signed in. Where the two disagree, the token is the stale one."
      />

      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="account-heading">Account</h2>
          {profile === null ? (
            <EmptyState
              title="The account could not be read."
              hint={`${apiHost()} did not answer, or the session is no longer valid. The session below is still shown, because it is read from your cookie rather than from the API.`}
            />
          ) : (
            <dl className="account-list">
              <Row label="Email">{profile.email}</Row>
              <Row label="Roles">
                <span className="flex flex-wrap justify-end gap-1.5">
                  {(profile.roles ?? []).length === 0 ? (
                    <span className="text-fg-muted">None</span>
                  ) : (
                    (profile.roles ?? []).map((role) => <Badge key={role}>{role}</Badge>)
                  )}
                </span>
              </Row>
              <Row label="Status">
                {profile.isActive ? (
                  <span className="account-ok">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Active
                  </span>
                ) : (
                  <span className="account-bad">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Disabled
                  </span>
                )}
              </Row>
              <Row label="User ID">{profile.id}</Row>
              <Row label="Created">
                <LocalTime value={profile.createdAt ?? null} />
              </Row>
              <Row label="Last updated">
                <LocalTime value={profile.updatedAt ?? null} />
              </Row>
            </dl>
          )}
        </Card>

        <Card>
          <h2 className="account-heading">Session</h2>
          {session === null ? (
            <EmptyState
              title="No readable session."
              hint="The cookie is missing or is not a JWT. Signing out and back in will replace it."
            />
          ) : (
            <dl className="account-list">
              <Row label="Expires in">
                <SessionCountdown expiresAt={session.expiresAt} />
              </Row>
              <Row label="Expires at">
                <LocalTime value={session.expiresAt} />
              </Row>
              <Row label="Signed in at">
                <LocalTime value={session.issuedAt} />
              </Row>
              <Row label="Session length">
                {session.lifetimeSeconds === null
                  ? '—'
                  : `${Math.round(session.lifetimeSeconds / 60)} minutes`}
              </Row>
              <Row label="Token type">{session.tokenType}</Row>
              <Row label="Signed with">{session.algorithm ?? '—'}</Row>
              <Row label="Token subject">{session.subject ?? '—'}</Row>
              <Row label="Token roles">
                {session.roles.length === 0 ? '—' : session.roles.join(', ')}
              </Row>
            </dl>
          )}

          {rolesDiffer && (
            <p className="account-note">
              The roles in your token differ from the roles on your account. The token was minted at
              sign-in and does not update; sign out and back in to pick up the change.
            </p>
          )}

          <p className="account-note">
            The session is stored in an <code>httpOnly</code> cookie, so no script on this page can
            read it — these values are decoded on the server. You are signed out automatically when
            it expires, and immediately if the API rejects a request.
          </p>
        </Card>

        <Card>
          <h2 className="account-heading">Connection</h2>
          <dl className="account-list">
            <Row label="API">{apiHost()}</Row>
            <Row label="Environment">
              {connection.state === 'unreachable' ? (
                <span className="text-error">Unreachable</span>
              ) : (
                <span className={environment === 'production' ? 'text-warning' : undefined}>
                  {environment}
                </span>
              )}
            </Row>
            {/* Only `/status` carries the database, and it is newer than the
                deployed API — see getSystemStatus. Unknown is the honest word
                for it; the API is answering, this one field just is not there. */}
            <Row label="Database">
              {connection.state === 'ok' ? connection.status.database : 'Unknown'}
            </Row>
            <Row label="API version">{version ?? '—'}</Row>
            {/* Deliberately alongside the rows above rather than derived from
                them: where the admin runs and which database it writes to are
                set independently, and the pairing is the thing worth reading. */}
            <Row label="This admin">
              {process.env.NODE_ENV === 'development' ? 'Local dev server' : 'Deployed'}
            </Row>
          </dl>
        </Card>
      </div>
    </Section>
  );
}
