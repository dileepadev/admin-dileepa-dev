'use client';

import { deleteEducation, publishEducation, saveEducation } from '@/app/actions/profile';
import { ResourceManager } from '@/components/resource/ResourceManager';
import type { ApiLink, Education } from '@/lib/types';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 */
export function EducationsScreen({
  records,
  endpoints,
}: {
  records: Education[];
  endpoints?: ApiLink | null;
}) {
  return (
    <ResourceManager<Education>
      endpoints={endpoints}
      label="Education"
      labelPlural="Educations"
      intro="Where you studied and what you came out with."
      records={records}
      describe={(row) => `${row.course} at ${row.institution}`}
      save={saveEducation}
      remove={deleteEducation}
      setPublished={publishEducation}
      blank={{ published: true, logo: { light: '', dark: '' } }}
      columns={[
        { header: 'Course', cell: (row) => row.course },
        { header: 'Institution', cell: (row) => row.institution },
        {
          header: 'Period',
          nowrap: true,
          cell: (row) => <span className="font-mono">{row.period}</span>,
        },
      ]}
      schema={{
        sections: [
          {
            legend: 'Study',
            fields: [
              { kind: 'text', name: 'course', label: 'Course', required: true },
              { kind: 'text', name: 'institution', label: 'Institution', required: true },
              {
                kind: 'text',
                name: 'period',
                label: 'Period',
                required: true,
                placeholder: 'Nov 2021 — Feb 2024',
              },
              { kind: 'url', name: 'url', label: 'Institution website' },
              {
                kind: 'textarea',
                name: 'description',
                label: 'Result',
                wide: true,
                placeholder: 'First class honours.',
              },
            ],
          },
          {
            legend: 'Logo',
            fields: [
              { kind: 'logo', name: 'logo', label: 'Logo', folder: 'education', wide: true },
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
