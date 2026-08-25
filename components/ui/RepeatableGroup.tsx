'use client';

import { useState, type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';

/**
 * A repeatable field group — speakers, photos, recordings, links, gallery,
 * metrics.
 *
 * Built once and reused, because six screens needed it and six hand-rolled
 * versions is six sets of index bugs.
 *
 * **The index in a field name is a row identity, not a position.** Rows are
 * given a key that never changes, and the field names use that key, so removing
 * a row from the middle does not silently re-label every row after it — which
 * is the bug where you delete the second speaker and the third one's data ends
 * up in its place. `lib/crud.ts` reads the groups by prefix and sorts the
 * indices, so gaps are harmless.
 */
export function RepeatableGroup<T>({
  legend,
  note,
  initial,
  blank,
  addLabel,
  children,
}: {
  legend: string;
  note?: string;
  initial: T[];
  blank: T;
  addLabel: string;
  children: (row: T, index: number) => ReactNode;
}) {
  const [rows, setRows] = useState(() =>
    (initial.length ? initial : []).map((value, index) => ({ key: index, value })),
  );
  const [nextKey, setNextKey] = useState(rows.length);

  function add() {
    setRows((current) => [...current, { key: nextKey, value: blank }]);
    setNextKey((key) => key + 1);
  }

  function removeAt(key: number) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  return (
    <fieldset className="border-border-hairline border-t-[0.5px] pt-6">
      <legend className="sr-only">{legend}</legend>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-fg text-small font-mono">{legend}</p>
          {note && <p className="text-fg-muted mt-1 text-xs">{note}</p>}
        </div>
        <Button type="button" variant="secondary" size="compact" onClick={add}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {addLabel}
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-fg-muted text-small">
          None yet. This is a normal state — nothing is missing.
        </p>
      ) : (
        rows.map((row, index) => (
          <div key={row.key} className="group">
            <div className="group-head">
              <span>
                {legend} {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeAt(row.key)}
                aria-label={`Remove ${legend.toLowerCase()} ${index + 1}`}
                className="hover:text-error inline-flex items-center gap-1.5 transition-colors duration-[160ms]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">{children(row.value, row.key)}</div>
          </div>
        ))
      )}
    </fieldset>
  );
}
