import 'server-only';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ApiError, isStaticBailout, resource } from '@/lib/api';

/**
 * One CRUD implementation, shared by every resource.
 *
 * The v1 admin had ten near-identical action files — about 2,300 lines of the
 * same fetch, the same Zod flattening, the same try/catch, the same
 * `revalidatePath`. Ten copies of a thing is ten places a fix has to land, and
 * in practice it lands in one or two. This is that code once; each resource's
 * `app/actions/*.ts` supplies a path, a schema, and how to read its form.
 *
 * This is deliberately **not** a `'use server'` module: those may only export
 * async functions, so a factory returning an object of them cannot live in one.
 * The thin `'use server'` wrappers are what the forms actually bind to.
 */

export interface ActionState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export const emptyState: ActionState = {};

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_form';
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}

/**
 * Turn a thrown error into something a person can act on.
 *
 * The API writes its messages to be read, so they are surfaced rather than
 * replaced with "Something went wrong". A 409 carries which field collided,
 * which is the one case worth attaching to a field rather than to the form.
 */
function toState(error: unknown, verb: string, label: string): ActionState {
  if (error instanceof ApiError) {
    if (error.code === 'conflict' && error.details && typeof error.details === 'object') {
      const field = (error.details as { field?: string }).field;
      if (field) return { errors: { [field]: [error.message] }, message: error.message };
    }
    return { message: error.message };
  }
  console.error(`Failed to ${verb} ${label}:`, error);
  return {
    message: `Could not ${verb} the ${label}. The API did not answer — check that it is running.`,
  };
}

/**
 * Read a collection, degrading to empty rather than taking the screen down.
 *
 * Every `getX()` in `app/actions/` used to be a bare
 * `(await resource(path).list()).items`, so an API that was not answering did
 * not produce an empty table — it produced a 500 on the whole route, and on
 * the dashboard index, which reads nine collections at once, it produced one
 * for any of the nine.
 *
 * Degrading is only honest because the failure is visible elsewhere: the
 * header's status badge turns red and the dashboard layout raises a banner
 * saying the API did not answer. Without that this would be the worst kind of
 * fix, quietly turning "the API is down" into "you have no projects".
 *
 * `isStaticBailout` is rethrown rather than caught — see `lib/api.ts`. It is
 * how Next learns the route is dynamic, and every screen here is.
 */
export async function readList<T>(path: string, label: string): Promise<T[]> {
  try {
    return (await resource<T>(path).list()).items;
  } catch (error) {
    if (isStaticBailout(error)) throw error;
    if (error instanceof ApiError) {
      console.error(`Could not list ${label}: ${error.message}`);
    } else {
      console.error(`Could not reach the API to list ${label}:`, error);
    }
    return [];
  }
}

export interface CrudOptions<Schema extends z.ZodType> {
  /** The API path, e.g. `/events`. */
  path: string;
  /** Singular, sentence case, for messages: "Event", "Blog post". */
  label: string;
  /** The route to revalidate after a write. */
  route: string;
  schema: Schema;
  /** Reads the form into the schema's input shape. */
  read: (formData: FormData) => unknown;
}

export async function save<Schema extends z.ZodType>(
  options: CrudOptions<Schema>,
  id: string | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = options.schema.safeParse(options.read(formData));
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), message: 'Some fields need attention.' };
  }

  const api = resource<unknown>(options.path);
  try {
    if (id) await api.update(id, parsed.data);
    else await api.create(parsed.data);
  } catch (error) {
    return toState(error, id ? 'update' : 'create', options.label.toLowerCase());
  }

  revalidatePath(options.route);
  return { success: true, message: id ? `${options.label} saved.` : `${options.label} created.` };
}

export async function remove(
  options: Pick<CrudOptions<z.ZodType>, 'path' | 'label' | 'route'>,
  id: string,
): Promise<ActionState> {
  try {
    await resource<unknown>(options.path).remove(id);
  } catch (error) {
    return toState(error, 'delete', options.label.toLowerCase());
  }
  revalidatePath(options.route);
  return { success: true, message: `${options.label} deleted.` };
}

export async function setPublished(
  options: Pick<CrudOptions<z.ZodType>, 'path' | 'label' | 'route'>,
  id: string,
  published: boolean,
): Promise<ActionState> {
  try {
    await resource<unknown>(options.path).update(id, { published });
  } catch (error) {
    return toState(error, 'update', options.label.toLowerCase());
  }
  revalidatePath(options.route);
  return {
    success: true,
    message: published ? `${options.label} is live.` : `${options.label} is hidden from the site.`,
  };
}

/**
 * Commit a new display order.
 *
 * **One request, not one per row.** Dragging a row to the top changes the
 * position of every row it passed, and sending a PATCH each would be N requests
 * racing each other into a half-applied order if one failed.
 *
 * `positions` is the list of ids in the order a person sees them, top first.
 * The mapping to stored values happens here, in one place, because it is the
 * one part of this that is easy to get backwards — see the note in the caller.
 */
export async function reorder(
  options: Pick<CrudOptions<z.ZodType>, 'path' | 'label' | 'route'>,
  positions: string[],
): Promise<ActionState> {
  // The platform sorts `order` DESCENDING — "higher values sort first", the
  // semantic every resource inherited from v1's `index: -1`. A person reading
  // the admin sees positions 1..N with 1 at the top, so the top row needs the
  // HIGHEST number, not the lowest. Inverting here keeps the display honest
  // without changing a convention seven other collections depend on.
  const items = positions.map((id, index) => ({ id, order: positions.length - index }));

  try {
    await resource<unknown>(options.path).reorder(items);
  } catch (error) {
    return toState(error, 'update', options.label.toLowerCase());
  }
  revalidatePath(options.route);
  return { success: true, message: 'Order saved.' };
}

// --- Form reading -----------------------------------------------------------
//
// FormData gives strings and nothing else. These are the four conversions every
// form needs, in one place, so "" and "not set" stop being the same value by
// accident.

export const text = (data: FormData, key: string): string => String(data.get(key) ?? '').trim();

/** An optional string. Empty becomes `null`, which is what the API means by unset. */
export const optional = (data: FormData, key: string): string | null => text(data, key) || null;

/** A checkbox. Absent means unchecked; browsers do not submit unchecked boxes. */
export const flag = (data: FormData, key: string): boolean => data.get(key) === 'on';

export const number = (data: FormData, key: string): number | null => {
  const raw = text(data, key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

/** A comma-separated field — tags, a stack, a technology list. */
export const list = (data: FormData, key: string): string[] =>
  text(data, key)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

/** A textarea where each line is one entry — the About page's paragraphs. */
export const lines = (data: FormData, key: string): string[] =>
  text(data, key)
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * A repeatable field group.
 *
 * The form names them `speakers.0.name`, `speakers.1.name` and so on, so the
 * indices survive a row being removed in the middle — which is the whole reason
 * they are read by prefix rather than by counting.
 */
export function groups<T>(
  data: FormData,
  prefix: string,
  build: (index: number, get: (field: string) => string) => T | null,
): T[] {
  const indices = new Set<number>();
  for (const key of data.keys()) {
    const match = key.match(new RegExp(`^${prefix}\\.(\\d+)\\.`));
    if (match) indices.add(Number(match[1]));
  }

  return [...indices]
    .sort((a, b) => a - b)
    .map((index) =>
      build(index, (field) => String(data.get(`${prefix}.${index}.${field}`) ?? '').trim()),
    )
    .filter((item): item is T => item !== null);
}
