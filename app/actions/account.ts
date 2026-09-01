'use server';

import { ApiError, isStaticBailout, request } from '@/lib/api';
import { getSession } from '@/lib/session';
import type { UserProfile } from '@/lib/types';

/**
 * The account screen's two reads: who is signed in, and what their session is.
 *
 * They come from different places on purpose. The **profile** is read from the
 * API, which reads it from the database, so it is current — a role changed or
 * an account disabled since sign-in shows up here. The **session** is read from
 * the token in the cookie, which is a snapshot of what was true when it was
 * minted. Showing both is the point: where they disagree, the difference is
 * the thing worth seeing.
 */

/** The account as the database has it now, or `null` if it cannot be read. */
export async function getProfile(): Promise<UserProfile | null> {
  try {
    return await request<UserProfile>('/auth/profile');
  } catch (error) {
    if (isStaticBailout(error)) throw error;
    if (!(error instanceof ApiError)) {
      console.error('Could not reach the API for /auth/profile:', error);
    }
    return null;
  }
}

/**
 * The claims carried by the session cookie.
 *
 * Every field is derived from the token; **the token itself never leaves the
 * server**. The cookie is `httpOnly` precisely so a script cannot read it, and
 * shipping the raw string to a client component to be decoded there would undo
 * that for the sake of a countdown.
 */
export interface SessionInfo {
  subject: string | null;
  email: string | null;
  roles: string[];
  /** `access` or `refresh`. A token minted by v1 carries no `type` claim. */
  tokenType: string;
  /** ISO 8601, or null when the claim is absent or unreadable. */
  issuedAt: string | null;
  expiresAt: string | null;
  /** Whole seconds the token is valid for, start to finish. */
  lifetimeSeconds: number | null;
  /** Signing algorithm, from the JOSE header — `HS256` here. */
  algorithm: string | null;
  valid: boolean;
}

function decodeSegment(segment: string): Record<string, unknown> | null {
  try {
    // JWT uses base64url. Node's base64 decoder accepts that alphabet, but the
    // padding has to be restored or the last group is dropped.
    const padded = segment.padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=');
    return JSON.parse(Buffer.from(padded, 'base64url').toString('utf-8')) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

const asString = (value: unknown): string | null => (typeof value === 'string' ? value : null);
const asSeconds = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export async function getSessionInfo(): Promise<SessionInfo | null> {
  const token = await getSession();
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const header = decodeSegment(parts[0]);
  const claims = decodeSegment(parts[1]);
  if (!claims) return null;

  const iat = asSeconds(claims.iat);
  const exp = asSeconds(claims.exp);

  return {
    subject: asString(claims.sub),
    email: asString(claims.email),
    roles: Array.isArray(claims.roles) ? claims.roles.filter((r) => typeof r === 'string') : [],
    // A token minted by the NestJS app carries no `type`; the API reads those
    // as access tokens, so this says the same rather than showing a blank.
    tokenType: asString(claims.type) ?? 'access',
    issuedAt: iat === null ? null : new Date(iat * 1000).toISOString(),
    expiresAt: exp === null ? null : new Date(exp * 1000).toISOString(),
    lifetimeSeconds: iat !== null && exp !== null ? exp - iat : null,
    algorithm: header ? asString(header.alg) : null,
    valid: exp === null ? true : exp * 1000 > Date.now(),
  };
}
