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
 *
 * It is a form section like any other — the same card, the same legend, the
 * same grid — with the rows nested inside it. It used to be a bare `<fieldset>`
 * with a top rule, so on the events form four of these in a row drew four
 * lines across the page and the rows inside them had no edge of their own.
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
    <fieldset className="form-section">
      <legend className="sr-only">{legend}</legend>

      <div className="form-section-head">
        <div className="min-w-0">
          <p className="form-section-title">
            {legend}
            {rows.length > 0 && <span className="text-fg-muted"> · {rows.length}</span>}
          </p>
          {note && <p className="form-section-note">{note}</p>}
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
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={row.key} className="group">
              <div className="group-head">
                <span className="text-fg text-label font-mono font-medium tracking-wide">
                  {legend} #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(row.key)}
                  aria-label={`Remove ${legend.toLowerCase()} ${index + 1}`}
                  className="text-fg-muted hover:text-error ease-brand text-label inline-flex cursor-pointer items-center gap-1.5 font-sans font-medium transition-colors duration-[160ms]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remove
                </button>
              </div>
              <div className="form-grid">{children(row.value, row.key)}</div>
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}
