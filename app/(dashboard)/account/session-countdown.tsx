'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * How long this session has left, counted down live.
 *
 * A client component for one reason: the number changes every second, and a
 * server-rendered "expires in 43 minutes" is wrong the moment it is read and
 * gets more wrong the longer the tab stays open — which on an admin screen is
 * hours.
 *
 * `expiresAt` arrives as an ISO string rather than a remaining duration, so
 * the countdown is anchored to a fixed instant. Passing "3600 seconds left"
 * would drift by however long the render and the network took, and would be
 * badly wrong for a tab restored from bfcache.
 *
 * Renders nothing until mounted, so the server's HTML and the first client
 * render agree — otherwise this is a hydration mismatch on every load.
 */
export function SessionCountdown({ expiresAt }: { expiresAt: string | null }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const target = Date.parse(expiresAt);
    if (Number.isNaN(target)) return;

    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  if (!expiresAt) return <span className="text-fg-muted">No expiry claim</span>;
  if (remaining === null) return <span className="text-fg-muted">…</span>;

  if (remaining === 0) {
    return <span className="text-error">Expired — the next request signs you out</span>;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [
    hours > 0 ? `${hours}h` : null,
    hours > 0 || minutes > 0 ? `${minutes}m` : null,
    `${seconds}s`,
  ].filter(Boolean);

  // Under five minutes is the point where it is worth saving what you are
  // doing rather than starting something, so it stops being neutral text.
  const urgent = totalSeconds < 300;

  return <span className={urgent ? 'text-warning' : undefined}>{parts.join(' ')}</span>;
}

/**
 * A timestamp in the reader's own timezone.
 *
 * Server-rendering `toLocaleString()` would format in the *server's* timezone
 * and then be rewritten on hydration, which is a mismatch on every load and a
 * wrong time until it resolves. So the server renders the unambiguous UTC
 * string and the client swaps in local time once it knows what local is.
 */
/** Never changes, so the subscribe callback has nothing to do. */
const noop = () => () => {};

export function LocalTime({ value }: { value: string | null }) {
  // `useSyncExternalStore` rather than `useState` + `useEffect`: this is a
  // derived value, not state being synchronised with anything, and React's own
  // rule says so. It also expresses the actual requirement precisely — the
  // server snapshot is `false` and the client snapshot is `true`, so the first
  // client render matches the server's HTML exactly and the local time appears
  // on the render immediately after.
  const onClient = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  if (!value) return <span className="text-fg-muted">—</span>;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return <span className="text-fg-muted">—</span>;

  if (!onClient) {
    // UTC, unambiguous, and what the server can honestly claim to know.
    return <span>{value.replace('T', ' ').replace(/\.\d+Z$/, ' UTC')}</span>;
  }

  return (
    <span>{parsed.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' })}</span>
  );
}
