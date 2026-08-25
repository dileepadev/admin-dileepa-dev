'use client';

import { deleteExperience, publishExperience, saveExperience } from '@/app/actions/profile';
import { ResourceManager } from '@/components/resource/ResourceManager';
import type { ApiLink, Experience } from '@/lib/types';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 */
export function ExperiencesScreen({
  records,
  endpoints,
}: {
  records: Experience[];
  endpoints?: ApiLink | null;
}) {
  return (
    <ResourceManager<Experience>
      endpoints={endpoints}
      label="Experience"
      labelPlural="Experiences"
      intro="Roles, newest first. The period is free text because it reads better that way — “Apr 2025 — Present”."
      records={records}
      describe={(row) => `${row.title} at ${row.company}`}
      save={saveExperience}
      remove={deleteExperience}
      setPublished={publishExperience}
      blank={{ published: true, logo: { light: '', dark: '' }, technologies: [] }}
      columns={[
        { header: 'Role', cell: (row) => row.title },
        { header: 'Company', cell: (row) => row.company },
        {
          header: 'Period',
          nowrap: true,
          cell: (row) => <span className="font-mono">{row.period}</span>,
        },
      ]}
      schema={{
        sections: [
          {
            legend: 'Role',
            fields: [
              { kind: 'text', name: 'title', label: 'Role title', required: true },
              { kind: 'text', name: 'company', label: 'Company', required: true },
              {
                kind: 'text',
                name: 'period',
                label: 'Period',
                required: true,
                placeholder: 'Apr 2025 — Present',
              },
              { kind: 'url', name: 'url', label: 'Company website' },
              {
                kind: 'textarea',
                name: 'description',
                label: 'What the role was for',
                required: true,
                wide: true,
              },
              {
                kind: 'list',
                name: 'technologies',
                label: 'Technologies',
                wide: true,
                hint: 'Comma separated. These render as chips under the entry.',
              },
            ],
          },
          {
            legend: 'Logo',
            note: 'Not rendered on the public site today; kept so it can be without a migration.',
            fields: [
              { kind: 'logo', name: 'logo', label: 'Logo', folder: 'experiences', wide: true },
            ],
          },
          {
            legend: 'Visibility',
            fields: [
              {
                kind: 'checkbox',
                name: 'published',
                label: 'Show on the site',
                hint: 'Unchecked keeps the record but hides it from every public caller.',
                wide: true,
              },
            ],
          },
        ],
      }}
    />
  );
}
