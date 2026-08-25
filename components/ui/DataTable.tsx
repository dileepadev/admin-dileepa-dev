import type { ReactNode } from 'react';
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

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Read by a screen reader in place of the table having no name. */
  caption?: string;
}) {
  const classesFor = (column: TableColumn<T>) =>
    cn(column.className, column.nowrap && 'whitespace-nowrap', column.actions && 'actions');

  return (
    <div className="table-wrap">
      <table className="data">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
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
          {rows.map((row) => (
            <tr key={rowKey(row)}>
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
