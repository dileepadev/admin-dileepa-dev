'use client';

import { useActionState, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
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
import { ResourceForm } from './ResourceForm';
import type { Column, FormSchema } from './fields';

/**
 * A collection screen: a table, and a form for one record.
 *
 * The form replaces the table rather than opening over it. A modal here would
 * put a repeatable group with six rows of fields inside a scrolling box inside
 * a scrolling page, and the record being edited is the only thing that matters
 * while it is being edited.
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
  describe,
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
  /** Names one record in a confirmation, so "delete this" says which. */
  describe: (row: T) => string;
}) {
  const [editing, setEditing] = useState<T | Partial<T> | null>(null);
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

    const result = await remove(row.id);
    toast.push({
      title: result.message,
      type: result.success ? 'success' : 'error',
      duration: 5000,
    });
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
    return (
      <>
        <SectionHeading
          label={labelPlural}
          title={editingId ? `Edit ${label.toLowerCase()}` : `New ${label.toLowerCase()}`}
          actions={
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          }
        />

        <form action={action} className="grid gap-8 pb-16">
          <FormMessage message={state.message} success={state.success} />
          <ResourceForm schema={schema} record={editing} errors={state.errors} />
          <div className="border-border-hairline flex gap-3 border-t-[0.5px] pt-6">
            <Button type="submit" disabled={pending}>
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
            cell: (row: T) => (
              <button type="button" onClick={() => void onTogglePublished(row)}>
                <PublishedBadge published={Boolean(row.published)} />
              </button>
            ),
          },
        ]
      : []),
    {
      header: '',
      className: 'text-right',
      cell: (row: T) => (
        <div className="flex justify-end gap-2">
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
            variant="secondary"
            size="compact"
            onClick={() => void onDelete(row)}
            aria-label={`Delete ${describe(row)}`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
        actions={
          <Button type="button" onClick={() => setEditing(blank)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New {label.toLowerCase()}
          </Button>
        }
      />

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
        <DataTable columns={allColumns} rows={records} rowKey={(row) => row.id} />
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
}: {
  label: string;
  title: string;
  intro: string;
  record: unknown;
  schema: FormSchema;
  save: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
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
      <form action={action} className="grid gap-8 pb-16">
        <FormMessage message={state.message} success={state.success} />
        <ResourceForm schema={schema} record={record} errors={state.errors} />
        <div className="border-border-hairline border-t-[0.5px] pt-6">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </>
  );
}

export { Card };
