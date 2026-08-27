'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, request } from '@/lib/api';
import type { ActionState } from '@/lib/crud';
import type { DatabaseStatus, MaintenanceResult } from '@/lib/types';

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
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
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
