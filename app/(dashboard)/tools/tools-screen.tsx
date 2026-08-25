'use client';

import { deleteTool, publishTool, saveTool } from '@/app/actions/profile';
import { ResourceManager } from '@/components/resource/ResourceManager';
import type { ApiLink, Tool } from '@/lib/types';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 */
export function ToolsScreen({
  records,
  endpoints,
}: {
  records: Tool[];
  endpoints?: ApiLink | null;
}) {
  return (
    <ResourceManager<Tool>
      endpoints={endpoints}
      label="Tool"
      labelPlural="Tools"
      intro="The stack you are currently productive in, not everything you have touched. These render as mono chips under Work."
      records={records}
      describe={(row) => row.name}
      save={saveTool}
      remove={deleteTool}
      setPublished={publishTool}
      blank={{ published: true, logo: { light: '', dark: '' } }}
      columns={[{ header: 'Name', cell: (row) => row.name }]}
      schema={{
        sections: [
          {
            legend: 'Tool',
            fields: [{ kind: 'text', name: 'name', label: 'Name', required: true, wide: true }],
          },
          {
            legend: 'Logo',
            note: 'The site renders the name only, so a missing logo costs nothing today.',
            fields: [{ kind: 'logo', name: 'logo', label: 'Logo', folder: 'tools', wide: true }],
          },
          {
            legend: 'Visibility',
            fields: [
              { kind: 'checkbox', name: 'published', label: 'Show on the site', wide: true },
            ],
          },
        ],
      }}
    />
  );
}
