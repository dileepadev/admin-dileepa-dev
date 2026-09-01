'use client';

import { useActionState, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  ApiEndpoints,
  Button,
  Card,
  DataTable,
  EmptyState,
  FormMessage,
  PublishedBadge,
  SectionHeading,
} from '@/components/ui';
import { useAlert } from '@/components/providers/alert-provider';
import { useToast } from '@/components/providers/toast-provider';
import type { ActionState } from '@/lib/crud';
import type { ApiLink } from '@/lib/types';
import { ResourceForm } from './ResourceForm';
import type { Column, FormSchema } from './fields';

/**
 * A collection screen: a table, and a form for one record.
 *
 * The form replaces the table rather than opening over it. A modal here would
 * put a repeatable group with six rows of fields inside a scrolling box inside
 * a scrolling page, and the record being edited is the only thing that matters
 * while it is being edited.
 *
 * `endpoints` is the API's description of this resource — which routes the
 * screen is using and what they expect. It is optional and failure-tolerant:
 * when the catalogue is unreachable the panel is simply absent.
 */

interface Record_ {
  id: string;
  published?: boolean;
}

export function ResourceManager<T extends Record_>({
  label,
  labelPlural,
  intro,
  records,
  columns,
  schema,
  blank,
  save,
  remove,
  setPublished,
  reorder,
  describe,
  endpoints,
}: {
  /** Singular, sentence case: "Event". */
  label: string;
  labelPlural: string;
  intro: string;
  records: T[];
  columns: Column<T>[];
  schema: FormSchema;
  /** The defaults a new record starts from. */
  blank: Partial<T>;
  save: (id: string | null, prevState: ActionState, formData: FormData) => Promise<ActionState>;
  remove: (id: string) => Promise<ActionState>;
  setPublished?: (id: string, published: boolean) => Promise<ActionState>;
  /**
   * Pass this to make the list drag-sortable.
   *
   * Receives the row ids top-first. What a position *means* in stored values is
   * decided in `lib/crud.ts` — the platform sorts `order` descending, so the
   * top row carries the highest number, and that inversion lives in exactly one
   * place rather than in every screen that offers reordering.
   */
  reorder?: (positions: string[]) => Promise<ActionState>;
  /** Names one record in a confirmation, so "delete this" says which. */
  describe: (row: T) => string;
  endpoints?: ApiLink | null;
}) {
  const [editing, setEditing] = useState<T | Partial<T> | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  // The order shown while a commit is in flight. `null` means "whatever the
  // server last sent" — dropping back to that on success is what stops the list
  // flickering between the optimistic order and the revalidated one.
  const [pendingOrder, setPendingOrder] = useState<string[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const toast = useToast();
  const alert = useAlert();

  const editingId =
    editing && 'id' in editing && typeof editing.id === 'string' ? editing.id : null;

  const [state, action, pending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await save(editingId, prevState, formData);
      if (result.success) {
        toast.push({ title: result.message, type: 'success', duration: 4000 });
        setEditing(null);
      }
      return result;
    },
    {},
  );

  async function onDelete(row: T) {
    const confirmed = await alert.show({
      title: `Delete this ${label.toLowerCase()}?`,
      message: `${describe(row)} will be removed from the API and from the site. This cannot be undone.`,
      confirmText: `Delete ${label.toLowerCase()}`,
      cancelText: 'Keep it',
      variant: 'danger',
    });
    if (!confirmed) return;

    setRemoving(row.id);
    const result = await remove(row.id);
    setRemoving(null);
    toast.push({
      title: result.message,
      type: result.success ? 'success' : 'error',
      duration: 5000,
    });
  }

  /**
   * What the table shows: the optimistic order if one is pending, else the
   * server's.
   *
   * Built by lookup rather than by sorting, so a record the pending list does
   * not mention — one created in another tab between the drag and the
   * revalidate — still appears, at the end, instead of vanishing.
   */
  const orderedRecords = useMemo(() => {
    if (!pendingOrder) return records;
    const byId = new Map(records.map((row) => [row.id, row]));
    const known = pendingOrder
      .map((id) => byId.get(id))
      .filter((row): row is T => row !== undefined);
    const seen = new Set(known.map((row) => row.id));
    return [...known, ...records.filter((row) => !seen.has(row.id))];
  }, [records, pendingOrder]);

  async function onReorder(positions: string[]) {
    if (!reorder) return;
    // Optimistic: the row moves under the cursor, not after a round trip.
    setPendingOrder(positions);
    setSavingOrder(true);
    const result = await reorder(positions);
    setSavingOrder(false);

    if (result.success) {
      // `revalidatePath` in the action re-fetches `records` in the new order,
      // so the optimistic copy has done its job and holding it would mean two
      // sources of truth.
      setPendingOrder(null);
    } else {
      // Snap back. Leaving a wrong order on screen after a failed save is how
      // someone ends up dragging the same row twice.
      setPendingOrder(null);
      toast.push({ title: result.message, type: 'error', duration: 5000 });
    }
  }

  async function onTogglePublished(row: T) {
    if (!setPublished) return;
    const result = await setPublished(row.id, !row.published);
    toast.push({
      title: result.message,
      type: result.success ? 'success' : 'error',
      duration: 4000,
    });
  }

  if (editing) {
    const heading = editingId ? `Edit ${label.toLowerCase()}` : `New ${label.toLowerCase()}`;

    return (
      <>
        <SectionHeading
          label={labelPlural}
          title={heading}
          // Which record, not just which kind of record. On a screen reached
          // from a table of twenty rows, "Edit community" alone does not say
          // which of the twenty you are in.
          intro={editingId ? describe(editing as T) : undefined}
          actions={
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          }
        />

        <ApiEndpoints link={endpoints ?? null} />

        <form action={action} className="grid gap-6 pb-4">
          <FormMessage message={state.message} success={state.success} />
          <ResourceForm schema={schema} record={editing} errors={state.errors} />
          <div className="form-actions">
            <Button type="submit" busy={pending}>
              {pending ? 'Saving…' : `Save ${label.toLowerCase()}`}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      </>
    );
  }

  const allColumns: Column<T>[] = [
    ...columns,
    ...(setPublished
      ? [
          {
            header: 'On the site',
            nowrap: true,
            cell: (row: T) => (
              <button
                type="button"
                onClick={() => void onTogglePublished(row)}
                aria-label={`${row.published ? 'Hide' : 'Show'} ${describe(row)} on the site`}
                className="ease-brand cursor-pointer rounded transition-opacity duration-[160ms] hover:opacity-80 focus-visible:outline-none"
              >
                <PublishedBadge published={Boolean(row.published)} />
              </button>
            ),
          },
        ]
      : []),
    {
      header: '',
      actions: true,
      cell: (row: T) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="compact"
            onClick={() => setEditing(row)}
            aria-label={`Edit ${describe(row)}`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Button>
          <Button
            type="button"
            variant="danger"
            size="compact"
            busy={removing === row.id}
            onClick={() => void onDelete(row)}
            aria-label={`Delete ${describe(row)}`}
          >
            {removing !== row.id && <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <SectionHeading
        label={labelPlural}
        title={labelPlural}
        intro={intro}
        count={records.length}
        actions={
          <Button type="button" onClick={() => setEditing(blank)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New {label.toLowerCase()}
          </Button>
        }
      />

      <ApiEndpoints link={endpoints ?? null} />

      {records.length === 0 ? (
        <EmptyState
          title={`No ${labelPlural.toLowerCase()} yet.`}
          hint={intro}
          action={
            <Button type="button" onClick={() => setEditing(blank)}>
              Add the first one
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={allColumns}
          rows={orderedRecords}
          rowKey={(row) => row.id}
          caption={labelPlural}
          reorder={
            reorder ? { onReorder: (ids) => void onReorder(ids), busy: savingOrder } : undefined
          }
        />
      )}
    </>
  );
}

/** A single-record screen — `/about` has no collection to list. */
export function SingletonManager({
  label,
  title,
  intro,
  record,
  schema,
  save,
  endpoints,
}: {
  label: string;
  title: string;
  intro: string;
  record: unknown;
  schema: FormSchema;
  save: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  endpoints?: ApiLink | null;
}) {
  const toast = useToast();
  const [state, action, pending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await save(prevState, formData);
      if (result.success) {
        toast.push({ title: result.message, type: 'success', duration: 4000 });
      }
      return result;
    },
    {},
  );

  return (
    <>
      <SectionHeading label={label} title={title} intro={intro} />
      <ApiEndpoints link={endpoints ?? null} />
      <form action={action} className="grid gap-6 pb-4">
        <FormMessage message={state.message} success={state.success} />
        <ResourceForm schema={schema} record={record} errors={state.errors} />
        <div className="form-actions">
          <Button type="submit" busy={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </>
  );
}

export { Card };
