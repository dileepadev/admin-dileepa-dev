'use client';

import { deletePillar, publishPillar, reorderPillars, savePillar } from '@/app/actions/profile';
import { ResourceManager } from '@/components/resource/ResourceManager';
import { PILLAR_ICONS, humanise } from '@/lib/constants';
import type { ApiLink, Pillar } from '@/lib/types';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 */
export function PillarsScreen({
  records,
  endpoints,
}: {
  records: Pillar[];
  endpoints?: ApiLink | null;
}) {
  return (
    <ResourceManager<Pillar>
      endpoints={endpoints}
      label="Pillar"
      labelPlural="Pillars"
      intro="The cards under the About section on the homepage — what you do, in six short blocks. They render three to a row in the order below, so the count reads best as a multiple of three. Drag a row, or use the arrows, to change it."
      records={records}
      describe={(row) => row.title}
      save={savePillar}
      remove={deletePillar}
      setPublished={publishPillar}
      reorder={reorderPillars}
      blank={{ published: true, icon: 'cpu' }}
      columns={[
        { header: 'Title', cell: (row) => row.title },
        { header: 'Icon', cell: (row) => humanise(row.icon) },
      ]}
      schema={{
        sections: [
          {
            legend: 'Card',
            note: 'Sentence case, and short. The description is one sentence on the card, not a paragraph.',
            fields: [
              { kind: 'text', name: 'title', label: 'Title', required: true, wide: true },
              {
                kind: 'textarea',
                name: 'description',
                label: 'Description',
                required: true,
                wide: true,
                rows: 3,
              },
            ],
          },
          {
            legend: 'Icon',
            note: 'The site draws the icon this names. The list is the API’s own closed set — anything outside it is refused on save rather than rendering an empty card.',
            fields: [
              {
                kind: 'select',
                name: 'icon',
                label: 'Icon',
                required: true,
                wide: true,
                options: PILLAR_ICONS,
              },
            ],
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
