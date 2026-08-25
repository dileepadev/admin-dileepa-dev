'use client';

import { deleteCommunity, publishCommunity, saveCommunity } from '@/app/actions/profile';
import { ResourceManager } from '@/components/resource/ResourceManager';
import type { ApiLink, Community } from '@/lib/types';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 *
 * The form is four sections rather than three, and the order is the order a
 * person fills it in: who the community is, what you do there, its logo, and
 * whether any of it is visible yet. It used to be one section of six fields
 * with a checkbox as the sixth — which left "Still involved" alone in the left
 * column under a full-width textarea, level with nothing, and put the two
 * visibility decisions in different sections of the page.
 */
export function CommunitiesScreen({
  records,
  endpoints,
}: {
  records: Community[];
  endpoints?: ApiLink | null;
}) {
  return (
    <ResourceManager<Community>
      endpoints={endpoints}
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
        {
          header: 'Period',
          nowrap: true,
          cell: (row) => <span className="font-mono">{row.period}</span>,
        },
      ]}
      schema={{
        sections: [
          {
            legend: 'The community',
            note: 'The name and the link are what a visitor sees; the period is free text and nothing sorts on it.',
            fields: [
              { kind: 'text', name: 'name', label: 'Name', required: true },
              {
                kind: 'url',
                name: 'communityUrl',
                label: 'Community page',
                hint: 'Where someone can go to find out more. Include https://.',
              },
            ],
          },
          {
            legend: 'Your involvement',
            fields: [
              {
                kind: 'text',
                name: 'role',
                label: 'Role',
                required: true,
                hint: 'What you are called there, e.g. "Lead organiser".',
              },
              {
                kind: 'text',
                name: 'period',
                label: 'Period',
                required: true,
                placeholder: 'Jan 2024 — Present',
                hint: 'Free text, shown as written. Use "Present" while it is current.',
              },
              {
                kind: 'textarea',
                name: 'description',
                label: 'What you do there',
                wide: true,
                rows: 4,
                hint: 'A sentence or two. This is the whole entry on the site.',
              },
            ],
          },
          {
            legend: 'Logo',
            note: 'Two files, one per theme. A logo that works on both foundations is normal — leave the dark one empty to reuse the light one.',
            fields: [
              { kind: 'logo', name: 'logo', label: 'Logo', folder: 'communities', wide: true },
            ],
          },
          {
            legend: 'Visibility',
            note: 'Both decisions in one place. "Still involved" is what the site reads to sort current groups above past ones; "Show on the site" is whether it appears at all.',
            fields: [
              { kind: 'checkbox', name: 'current', label: 'Still involved' },
              { kind: 'checkbox', name: 'published', label: 'Show on the site' },
            ],
          },
        ],
      }}
    />
  );
}
