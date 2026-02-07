import 'server-only';
import { cookies } from 'next/headers';

export async function createSession(token: string) {
  const cookieStore = await cookies();

  // Try to read exp from JWT (second segment) without external deps
  let maxAge = 60 * 60 * 24 * 7; // fallback 7 days in seconds
  let expiresAt: string | undefined = undefined;

  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8')) as {
        exp?: number;
      };
      if (payload?.exp) {
        const nowSec = Math.floor(Date.now() / 1000);
        const ttl = payload.exp - nowSec;
        if (ttl > 0) {
          maxAge = ttl;
        } else {
          maxAge = 0;
        }
        expiresAt = new Date(payload.exp * 1000).toISOString();
      }
    }
  } catch (e) {
    // silently ignore parsing errors and use fallback
    console.warn('Failed to parse JWT exp claim', e);
  }

  // Set the httpOnly session cookie with expiry matching token
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  // Also set a non-httpOnly cookie with the expiry timestamp so client code can schedule auto-logout
  if (expiresAt) {
    cookieStore.set('session_expires', expiresAt, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  return session?.value;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  // Remove the client-visible expiry cookie as well
  cookieStore.delete('session_expires');
}

export async function broadcastSignOut() {
  const cookieStore = await cookies();
  const ts = new Date().toISOString();
  // set a short-lived non-httpOnly cookie so clients can detect server-initiated sign-outs
  cookieStore.set('signed_out_broadcast', ts, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10, // seconds
  });
}
