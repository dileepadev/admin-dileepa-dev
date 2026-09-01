'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, isStaticBailout, request } from '@/lib/api';
import type { ActionState } from '@/lib/crud';
import type {
  Connection,
  DatabaseStatus,
  MaintenanceResult,
  SystemStatus,
  Version,
} from '@/lib/types';

/**
 * Database maintenance — development only.
 *
 * Two destructive operations aimed at whichever database the API this app talks
 * to is pointed at. Neither exists on the production API: `app/main.py` there
 * does not register the router, so every call below is a 404 rather than a 403.
 * That is what `getDatabaseStatus` returning `null` means, and why the screen
 * treats it as "this API does not offer the feature" rather than as an error.
 *
 * The direction is fixed in the API, not here. This app sends a confirmation
 * and nothing else — it cannot name a source, a target, or a direction, so
 * there is no argument it could get backwards.
 */

/**
 * Both databases, their counts, and whether a copy can run.
 *
 * `null` when the API does not serve these routes at all, which is the normal
 * answer when `API_URL` points at production.
 */
export async function getDatabaseStatus(): Promise<DatabaseStatus | null> {
  try {
    return await request<DatabaseStatus>('/maintenance/database');
  } catch (error) {
    // A 404 means the feature does not exist here — expected in production,
    // handled by the screen. Anything else, including the API not answering
    // at all, degrades the same way: `fetch` itself throws a plain
    // `TypeError` rather than an `ApiError` when the connection is refused,
    // so this cannot be narrowed to `ApiError` without an unreachable API
    // crashing the page instead of the screen saying so.
    if (isStaticBailout(error)) throw error;
    if (!(error instanceof ApiError)) {
      console.error('Could not reach the API for /maintenance/database:', error);
    }
    return null;
  }
}

/**
 * Which deployment this session is actually talking to — environment,
 * version, and the database with credentials stripped.
 *
 * Unlike `getDatabaseStatus`, this is served in every environment: a session
 * pointed at `api.dileepa.dev` should say "production" here just as plainly as
 * one pointed at a laptop says "development".
 *
 * **`/status` may not exist.** It is newer than the deployed API, and will be
 * until the API ships again. A 404 there says nothing about whether the API
 * works — every other screen reads endpoints that have been there since v2.0.0
 * and is fine. So a 404 falls back to `/version`, which is public, has been
 * deployed all along, and carries the environment and version. The badge then
 * shows what is known and marks the rest unknown, instead of the dashboard
 * announcing that an API it is successfully reading from is not answering.
 *
 * Only a genuine transport failure returns `unreachable`. That distinction is
 * the whole point of the return type: see `Connection` in `lib/types.ts`.
 */
export async function getSystemStatus(): Promise<Connection> {
  try {
    return { state: 'ok', status: await request<SystemStatus>('/status') };
  } catch (error) {
    // This runs in the dashboard's root layout, on every screen, so an
    // uncaught error here does not fail one page — it fails all of them.
    if (isStaticBailout(error)) throw error;

    if (error instanceof ApiError && error.status === 404) {
      try {
        // Public, so this works even where the session is the thing at fault.
        const version = await request<Version>('/version', { auth: false });
        return {
          state: 'partial',
          environment: version.environment,
          version: version.version,
        };
      } catch (fallbackError) {
        if (isStaticBailout(fallbackError)) throw fallbackError;
        return { state: 'unreachable' };
      }
    }

    // `fetch` throws a plain `TypeError` (not an `ApiError`) when the API is
    // simply not there to answer, which a narrower catch would let through.
    if (!(error instanceof ApiError)) {
      console.error('Could not reach the API for /status:', error);
      return { state: 'unreachable' };
    }

    // An ApiError that is not a 404 — 401 on an expired token, most likely.
    // The API is demonstrably answering, so `/version` can still fill the badge.
    try {
      const version = await request<Version>('/version', { auth: false });
      return { state: 'partial', environment: version.environment, version: version.version };
    } catch {
      return { state: 'unreachable' };
    }
  }
}

export interface MaintenanceState extends ActionState {
  result?: MaintenanceResult;
}

async function run(path: string, confirm: string, verb: string): Promise<MaintenanceState> {
  try {
    const result = await request<MaintenanceResult>(path, {
      method: 'POST',
      body: { confirm },
    });
    // Every screen reads this database, so all of them are now stale.
    revalidatePath('/', 'layout');
    return { success: true, result, message: summarise(result) };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message };
    console.error(`Failed to ${verb} the database:`, error);
    return {
      message: `Could not ${verb} the database. The API did not answer — check that it is running.`,
    };
  }
}

function summarise(result: MaintenanceResult): string {
  const collections = (result.collections ?? []).length;
  if (result.action === 'clear') {
    return `Removed ${result.documentsRemoved} document${
      result.documentsRemoved === 1 ? '' : 's'
    } from ${collections} collection${collections === 1 ? '' : 's'}.`;
  }
  return `Copied ${result.documentsCopied} document${
    result.documentsCopied === 1 ? '' : 's'
  } from ${result.source} into ${result.target}, replacing ${result.documentsRemoved}.`;
}

/** Replace this database's contents with the source's. */
export async function copyFromSource(confirm: string): Promise<MaintenanceState> {
  return run('/maintenance/database/copy', confirm, 'copy into');
}

/** Empty this database, copying nothing into it. */
export async function clearDatabase(confirm: string): Promise<MaintenanceState> {
  return run('/maintenance/database/clear', confirm, 'clear');
}
