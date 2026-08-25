import type { ReactNode } from 'react';

/**
 * The list table.
 *
 * A wide table scrolls inside its own box rather than pushing the page
 * sideways, which is what `.table-wrap` is for. Column headers are mono and
 * sentence case; they are labels, not headings.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
}: {
  columns: { header: string; cell: (row: T) => ReactNode; className?: string }[];
  rows: T[];
  rowKey: (row: T) => string;
}) {
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.header} className={column.className}>
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
