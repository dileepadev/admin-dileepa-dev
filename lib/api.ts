import 'server-only';

import { getSession } from '@/lib/session';

/**
 * The FastAPI client.
 *
 * Everything the admin reads or writes goes through here. Three things the v1
 * code did not do, and each was a bug:
 *
 * 1. **Collections are enveloped.** `{ items, total, limit, offset }` on every
 *    resource. The v1 actions read a bare array, so the first thing that
 *    happens against v2 is `.map is not a function`.
 * 2. **Errors have one shape.** `{ error: { code, message, details } }`. The
 *    API writes those messages to be read by a person, so they are surfaced
 *    rather than replaced with "Something went wrong".
 * 3. **An empty list is a 200.** v1 threw 404 when a collection was empty, so
 *    every action carried a `if (status === 404) return []` branch that also
 *    swallowed genuinely missing records.
 */

/**
 * Hosts where plaintext HTTP is the normal, correct thing. Anything else
 * reached over `http://` is a live network carrying an admin bearer token.
 */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1', 'host.docker.internal']);

/**
 * `API_URL` as requests will actually use it.
 *
 * Two corrections, both for mistakes that are almost invisible in a dotenv
 * file and total in their effect:
 *
 * 1. **A trailing slash.** Every endpoint below starts with `/`, so
 *    `http://api.dileepa.dev/` builds `http://api.dileepa.dev//projects`.
 *    FastAPI does not collapse that — it 404s. The admin then renders as if
 *    every collection were empty, on every screen, with no error anywhere,
 *    because a 404 per resource is indistinguishable from having no data.
 * 2. **`http://` to a remote host.** The bearer token goes in a request
 *    header. Over plaintext it is readable by anything on the path, and the
 *    301 to HTTPS does not help: the first request has already left the
 *    machine with the token in it. Upgrading here means it never does.
 *
 * Upgrading rather than throwing is deliberate. Throwing at module load takes
 * the whole admin down over a one-character config typo, and the safe value is
 * unambiguous — nobody means "send my admin token in the clear". It is loud
 * about it instead: the warning names the file to fix, and the header badge
 * shows the corrected host on every screen.
 */
function normalizeApiUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    // Not a URL at all. Left verbatim so the failure names the actual value —
    // a fabricated one would send someone looking in the wrong place.
    console.warn(`API_URL is not a valid URL: ${raw}. Fix it in .env.`);
    return trimmed;
  }

  if (url.protocol === 'http:' && !LOCAL_HOSTS.has(url.hostname)) {
    console.warn(
      `API_URL points at ${url.host} over http://, which would send the admin ` +
        `bearer token in cleartext. Using https:// instead — fix it in .env.`,
    );
    url.protocol = 'https:';
  }

  return url.href.replace(/\/+$/, '');
}

export const API_URL = normalizeApiUrl(process.env.API_URL || 'http://localhost:8000');

/**
 * The host this deployment talks to, for the header badge and the Account
 * screen. Falls back to the raw value when `API_URL` does not parse, which is
 * exactly when showing it verbatim is most useful.
 */
export function apiHost(): string {
  try {
    return new URL(API_URL).host;
  } catch {
    return API_URL;
  }
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function readError(response: Response, endpoint: string): Promise<ApiError> {
  try {
    const body = (await response.json()) as {
      error?: { code: string; message: string; details?: unknown };
    };
    if (body?.error?.code) {
      return new ApiError(response.status, body.error.code, body.error.message, body.error.details);
    }
  } catch {
    // A non-JSON error body is still an error; fall through.
  }
  return new ApiError(
    response.status,
    'http_error',
    `${endpoint} returned ${response.status} ${response.statusText}`,
  );
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Sent with the admin's bearer token. Reads of public data do not need it. */
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_URL}${endpoint}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  if (options.auth !== false) {
    const token = await getSession();
    if (!token) throw new ApiError(401, 'unauthorized', 'Your session has expired. Sign in again.');
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    // The admin is the thing that writes the data. Reading a cached copy of
    // what you just changed is the single most confusing bug an admin can have.
    cache: 'no-store',
  });

  if (!response.ok) throw await readError(response, endpoint);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/**
 * A resource, typed once.
 *
 * `admin=true` on the list is what makes unpublished records visible here —
 * the public site sees published rows only, and an admin that could not see a
 * draft could not publish one.
 */
export function resource<T>(path: string) {
  return {
    list: (query: RequestOptions['query'] = {}) =>
      request<Page<T>>(path, { query: { limit: 200, published: undefined, ...query } }),
    get: (identifier: string) => request<T>(`${path}/${identifier}`),
    create: (body: unknown) => request<T>(path, { method: 'POST', body }),
    update: (identifier: string, body: unknown) =>
      request<T>(`${path}/${identifier}`, { method: 'PATCH', body }),
    remove: (identifier: string) => request<void>(`${path}/${identifier}`, { method: 'DELETE' }),
    /** One request per drag-and-drop commit, not one PATCH per row. */
    reorder: (items: { id: string; order: number }[]) =>
      request<void>(`${path}/order`, { method: 'PATCH', body: { items } }),
  };
}

/** The single record resources — `/about` has no collection. */
export const singleton = <T>(path: string) => ({
  get: () => request<T>(path, { auth: false }),
  update: (body: unknown) => request<T>(path, { method: 'PATCH', body }),
});

/**
 * Next's own signal that a route bailed out of static rendering because
 * something in it read cookies — every authenticated read here does.
 *
 * It is control flow, not a failure, and it **must be rethrown**. Next catches
 * it to mark the route dynamic; swallowing it in a `catch` that was meant for
 * network errors would leave the route looking static, and Next would then
 * prerender it at build time with whatever a cookie-less request returned —
 * which is nothing. A page that degrades to empty when the API is down is a
 * feature; a page frozen at build time showing empty is a bug.
 */
export function isStaticBailout(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    error.digest === 'DYNAMIC_SERVER_USAGE'
  );
}

export { request };
