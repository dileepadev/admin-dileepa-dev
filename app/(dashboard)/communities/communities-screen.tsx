'use client';

import { deleteCommunity, publishCommunity, saveCommunity } from '@/app/actions/profile';
import { ResourceManager } from '@/components/resource/ResourceManager';
import type { Community } from '@/lib/types';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 */
export function CommunitiesScreen({ records }: { records: Community[] }) {
  return (
    <ResourceManager<Community>
      label="Community"
      labelPlural="Communities"
      intro="Groups you organise with or volunteer for."
      records={records}
      describe={(row) => row.name}
      save={saveCommunity}
      remove={deleteCommunity}
      setPublished={publishCommunity}
      blank={{ published: true, current: true, logo: { light: '', dark: '' } }}
      columns={[
        { header: 'Community', cell: (row) => row.name },
        { header: 'Role', cell: (row) => row.role },
        { header: 'Period', cell: (row) => <span className="font-mono">{row.period}</span> },
      ]}
      schema={{
        sections: [
          {
            legend: 'Community',
            fields: [
              { kind: 'text', name: 'name', label: 'Name', required: true },
              { kind: 'text', name: 'role', label: 'Role', required: true },
              {
                kind: 'text',
                name: 'period',
                label: 'Period',
                required: true,
                placeholder: 'Jan 2024 — Present',
              },
              { kind: 'url', name: 'communityUrl', label: 'Community page' },
              {
                kind: 'textarea',
                name: 'description',
                label: 'What you do there',
                wide: true,
              },
              { kind: 'checkbox', name: 'current', label: 'Still involved' },
            ],
          },
          {
            legend: 'Logo',
            fields: [
              { kind: 'logo', name: 'logo', label: 'Logo', folder: 'communities', wide: true },
            ],
          },
          {
            legend: 'Visibility',
            fields: [{ kind: 'checkbox', name: 'published', label: 'Show on the site' }],
          },
        ],
      }}
    />
  );
}
