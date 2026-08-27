'use server';

import { cache } from 'react';
import { ApiError, isStaticBailout, resource } from '@/lib/api';
import type { ApiLink } from '@/lib/types';

/**
 * The API's own endpoint catalogue.
 *
 * Every screen shows the endpoint it reads and writes and the variables that
 * endpoint expects. Answering that used to mean opening this repository next
 * to `api-dileepa-dev` and trusting the pair still agreed; it is data now, and
 * `GET /api-links` derives it from the live route table.
 *
 * **A screen never fails over this.** It is context, not content: if the API
 * is unreachable or the catalogue is missing, the panel does not render and
 * the screen behaves exactly as it did before it existed. That is the one
 * place in this app where swallowing an error is right — everything that
 * carries a person's data surfaces its failures loudly, and a description of
 * an endpoint is not that.
 *
 * `cache` dedupes it within a single render, so a page that asks twice makes
 * one request.
 */
export const getApiLinks = cache(async (): Promise<ApiLink[]> => {
  try {
    return (await resource<ApiLink>('/api-links').list()).items;
  } catch (error) {
    // Rethrown, not swallowed: this is how Next learns the route is dynamic.
    if (isStaticBailout(error)) throw error;
    // An expired, invalid, or missing session on an admin-only endpoint, or
    // an older API without /api-links (404), is not a fatal failure. The
    // catalogue is context, not content: when it cannot be read, the panel
    // simply does not render and the screen behaves as it did before.
    if (error instanceof ApiError) {
      if (error.status !== 401 && error.status !== 403 && error.status !== 404) {
        console.warn('Could not read the API catalogue:', error.message);
      }
    }
    return [];
  }
});

/**
 * One group, by its OpenAPI tag.
 *
 * The tag is the key — `communities`, `events`, `uploads` — and it is what a
 * screen names. Where a screen's own name differs from the API's, the screen
 * passes the API's: `/media` reads `uploads`, because that is the endpoint it
 * is actually talking to and saying otherwise would defeat the point.
 */
export async function getApiLink(key: string): Promise<ApiLink | null> {
  const links = await getApiLinks();
  return links.find((link) => link.key === key) ?? null;
}
