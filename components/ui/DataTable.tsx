'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The list table.
 *
 * A wide table scrolls inside its own box rather than pushing the page
 * sideways, which is what `.table-wrap` is for. Column headers are mono,
 * uppercase and small; they are labels, not headings.
 *
 * **Columns say how much room they need.** `table-layout: auto` gave the
 * widest column whatever it asked for and squeezed everything else, which is
 * how a ten-character date ended up wrapping onto three lines beside a title
 * that had room to spare. A column can now declare itself `nowrap` — dates,
 * counts, ids, anything with a known width — and `.actions` for the trailing
 * button column, which takes the minimum and stays right.
 */
export interface TableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Never wrap this column. Use it for dates, ids, counts and slugs. */
  nowrap?: boolean;
  /** The trailing row-action column: minimum width, right aligned. */
  actions?: boolean;
}

/**
 * Opt-in drag-to-reorder.
 *
 * `onReorder` receives the row ids in their new order, top first. The table
 * does not touch the numbers: what a position *means* is the caller's business,
 * and the two directions in use on this platform are easy to confuse.
 */
export interface ReorderConfig {
  onReorder: (orderedIds: string[]) => void;
  /** Disables the controls while a commit is in flight. */
  busy?: boolean;
}

/** Move one item, returning a new array. */
function moved<T>(items: T[], from: number, to: number): T[] {
  if (from === to || to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  reorder,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Read by a screen reader in place of the table having no name. */
  caption?: string;
  /** Pass this to make the rows drag-sortable. */
  reorder?: ReorderConfig;
}) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const classesFor = (column: TableColumn<T>) =>
    cn(column.className, column.nowrap && 'whitespace-nowrap', column.actions && 'actions');

  function commit(from: number, to: number) {
    if (!reorder || from === to) return;
    const next = moved(rows, from, to);
    if (next !== rows) reorder.onReorder(next.map(rowKey));
  }

  return (
    <div className="table-wrap">
      <table className="data">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {reorder && (
              <th scope="col" className="w-[5.5rem] whitespace-nowrap">
                <span className="sr-only">Reorder</span>#
              </th>
            )}
            {columns.map((column) => (
              <th key={column.header} scope="col" className={classesFor(column)}>
                {/* The actions column has no label; an empty `<th>` still has
                    to be announced as something. */}
                {column.header || <span className="sr-only">Actions</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey(row)}
              draggable={Boolean(reorder) && !reorder?.busy}
              onDragStart={(event) => {
                setDragging(index);
                // Firefox ignores a drag that carries no data.
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', rowKey(row));
              }}
              onDragOver={(event) => {
                if (dragging === null) return;
                // Without preventDefault the drop never fires at all.
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setOver(index);
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dragging !== null) commit(dragging, index);
                setDragging(null);
                setOver(null);
              }}
              onDragEnd={() => {
                setDragging(null);
                setOver(null);
              }}
              className={cn(
                reorder && 'transition-[background-color,opacity]',
                dragging === index && 'opacity-40',
                over === index && dragging !== index && 'bg-surface-hover',
              )}
            >
              {reorder && (
                <td className="whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <GripVertical
                      className={cn(
                        'text-fg-muted h-4 w-4 shrink-0',
                        reorder.busy ? 'cursor-not-allowed' : 'cursor-grab',
                      )}
                      aria-hidden="true"
                    />
                    <span className="text-fg-muted font-mono tabular-nums">{index + 1}</span>
                    {/* Drag is a mouse gesture. These are how the same job gets
                        done with a keyboard or a thumb, which is most of the
                        reason they exist rather than being a nicety. */}
                    <span className="ml-1 flex flex-col">
                      <button
                        type="button"
                        disabled={reorder.busy || index === 0}
                        onClick={() => commit(index, index - 1)}
                        aria-label={`Move to position ${index}`}
                        className="text-fg-muted hover:text-brand disabled:hover:text-fg-muted transition-colors disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={reorder.busy || index === rows.length - 1}
                        onClick={() => commit(index, index + 1)}
                        aria-label={`Move to position ${index + 2}`}
                        className="text-fg-muted hover:text-brand disabled:hover:text-fg-muted transition-colors disabled:opacity-30"
                      >
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                </td>
              )}
              {columns.map((column) => (
                <td key={column.header} className={classesFor(column)}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
