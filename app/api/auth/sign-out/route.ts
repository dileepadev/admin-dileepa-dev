import { deleteSession, broadcastSignOut } from '@/lib/session';
import { NextResponse } from 'next/server';

/**
 * Sign-out, for the client-side session watcher.
 *
 * POST only, deliberately. This clears the session cookie, and a GET that
 * changes state can be triggered by any cross-site top-level navigation —
 * `sameSite: 'lax'` sends the session cookie on exactly those. That made a
 * plain link on someone else's page enough to sign the admin out. A
 * cross-site POST is not a top-level navigation, so Lax withholds the cookie
 * and the request cannot be forged.
 *
 * `SessionWatcher` is the only caller and has always used POST.
 */
export async function POST() {
  await deleteSession();
  await broadcastSignOut();
  return NextResponse.json({ ok: true });
}
