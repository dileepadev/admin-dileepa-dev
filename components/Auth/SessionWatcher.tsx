'use client';

import { useEffect, useRef } from 'react';

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

async function doSignOut() {
  const isSignInPage = window.location.pathname === '/sign-in';

  try {
    await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'same-origin' });
  } catch {
    // ignore
  }

  // notify other tabs
  try {
    localStorage.setItem('signed_out', Date.now().toString());
  } catch {}

  // clear client-side timer cookies to prevent loops
  document.cookie = 'session_expires=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'signed_out_broadcast=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // redirect to sign-in ONLY if we are not already there
  if (!isSignInPage) {
    window.location.href = '/sign-in';
  }
}

export default function SessionWatcher() {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function scheduleFromCookie() {
      // Check server-initiated broadcast cookie first
      const broadcast = readCookie('signed_out_broadcast');
      if (broadcast) {
        // clear the cookie so we don't keep triggering
        document.cookie = 'signed_out_broadcast=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        doSignOut();
        return;
      }

      const expires = readCookie('session_expires');
      if (!expires) return;
      const expMs = Date.parse(expires);
      const now = Date.now();
      const msUntil = expMs - now;
      if (msUntil <= 0) {
        // already expired
        doSignOut();
        return;
      }
      // clear previous
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      // schedule logout
      timeoutRef.current = window.setTimeout(() => {
        doSignOut();
      }, msUntil + 1000);
    }

    // run immediately
    scheduleFromCookie();

    // Also poll every minute as a backup
    const interval = window.setInterval(scheduleFromCookie, 60 * 1000);

    // Monkey-patch fetch to auto-logout on 401 responses (client-side requests)
    const originalFetch = window.fetch;
    const win = window as unknown as Window & { fetch: typeof fetch };
    win.fetch = async function (...args: Parameters<typeof fetch>): Promise<Response> {
      const res = await originalFetch(...(args as Parameters<typeof fetch>));

      // Avoid recursion if sign-out itself returns 401
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url;
      const isSignOut = url?.includes('/api/auth/sign-out') ?? false;

      if (res?.status === 401 && !isSignOut) {
        // token invalid/expired, ensure we logout
        doSignOut();
      }
      return res;
    };

    // Listen for storage events from other tabs (logout broadcast)
    function onStorage(e: StorageEvent) {
      if (e.key === 'signed_out' && window.location.pathname !== '/sign-in') {
        // another tab signed out
        window.location.href = '/sign-in';
      }
    }

    window.addEventListener('storage', onStorage);

    return () => {
      // restore original fetch
      win.fetch = originalFetch;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return null;
}
