'use client';

import { deleteProject, publishProject, saveProject } from '@/app/actions/projects';
import { ResourceManager } from '@/components/resource/ResourceManager';
import { PROJECT_STATUSES, humanise } from '@/lib/constants';
import type { ApiLink, Project } from '@/lib/types';
import { Badge } from '@/components/ui';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 */
export function ProjectsScreen({
  records,
  endpoints,
}: {
  records: Project[];
  endpoints?: ApiLink | null;
}) {
  return (
    <ResourceManager<Project>
      endpoints={endpoints}
      label="Project"
      labelPlural="Projects"
      intro="Things you have built. Featured ones appear under Work on the homepage; every one has a detail page."
      records={records}
      describe={(row) => row.name}
      save={saveProject}
      remove={deleteProject}
      setPublished={publishProject}
      blank={{
        published: true,
        status: 'active',
        stack: [],
        tags: [],
        categories: [],
        gallery: [],
        metrics: [],
        highlights: [],
      }}
      columns={[
        { header: 'Project', cell: (row) => row.name },
        { header: 'Status', nowrap: true, cell: (row) => <Badge>{humanise(row.status)}</Badge> },
        {
          header: 'Featured',
          nowrap: true,
          cell: (row) => <span className="font-mono">{row.featured ? 'yes' : '—'}</span>,
        },
      ]}
      schema={{
        sections: [
          {
            legend: 'Project',
            note: 'The slug is the URL. Once a project is published, never change it.',
            fields: [
              {
                kind: 'text',
                name: 'slug',
                label: 'Slug',
                required: true,
                hint: 'Lower case, digits and single hyphens.',
              },
              { kind: 'text', name: 'name', label: 'Name', required: true },
              {
                kind: 'textarea',
                name: 'tagline',
                label: 'Tagline',
                wide: true,
                rows: 3,
                hint: 'One line. This is what the list shows.',
              },
              {
                kind: 'textarea',
                name: 'description',
                label: 'Description',
                wide: true,
                rows: 8,
                hint: 'Blank lines separate paragraphs on the detail page.',
              },
            ],
          },
          {
            legend: 'Status and timeline',
            note: 'Leave the end date empty while it is still running — that is what "still running" means here, not the status.',
            fields: [
              { kind: 'select', name: 'status', label: 'Status', options: PROJECT_STATUSES },
              { kind: 'text', name: 'role', label: 'Your role' },
              { kind: 'date', name: 'period.start', label: 'Started' },
              { kind: 'date', name: 'period.end', label: 'Ended' },
            ],
          },
          {
            legend: 'Stack and tags',
            note: 'Comma separated, all three.',
            fields: [
              { kind: 'list', name: 'stack', label: 'Stack', wide: true },
              { kind: 'list', name: 'categories', label: 'Categories' },
              { kind: 'list', name: 'tags', label: 'Tags' },
            ],
          },
          {
            legend: 'Highlights',
            note: 'One per line. These are sentences, so they are not comma separated.',
            fields: [
              {
                kind: 'textarea',
                name: 'highlights',
                label: 'Highlights',
                wide: true,
                rows: 5,
              },
            ],
          },
          {
            legend: 'Links',
            fields: [
              { kind: 'url', name: 'links.repo', label: 'Repository' },
              { kind: 'url', name: 'links.demo', label: 'Demo' },
              { kind: 'url', name: 'links.docs', label: 'Documentation' },
              { kind: 'url', name: 'links.caseStudy', label: 'Case study' },
              { kind: 'url', name: 'links.package', label: 'Package', wide: true },
            ],
          },
          {
            legend: 'Cover',
            note: 'Alt text is not optional — it is what a screen reader has to work with.',
            fields: [
              { kind: 'image', name: 'cover.url', label: 'Cover image', folder: 'projects' },
              { kind: 'text', name: 'cover.alt', label: 'Cover alt text' },
            ],
          },
          {
            legend: 'Visibility',
            fields: [
              {
                kind: 'checkbox',
                name: 'featured',
                label: 'Feature on the homepage',
                hint: 'The homepage shows three. More than three featured means the extras do not appear.',
              },
              { kind: 'checkbox', name: 'published', label: 'Show on the site' },
            ],
          },
        ],
        groups: [
          {
            name: 'gallery',
            legend: 'Gallery image',
            addLabel: 'Add image',
            note: 'Screenshots on the project detail page.',
            fields: [
              { kind: 'image', name: 'url', label: 'Image', folder: 'projects', wide: true },
              { kind: 'text', name: 'alt', label: 'Alt text' },
              { kind: 'text', name: 'caption', label: 'Caption' },
            ],
          },
          {
            name: 'metrics',
            legend: 'Metric',
            addLabel: 'Add metric',
            note: 'A number worth stating, with what it measures.',
            fields: [
              { kind: 'text', name: 'label', label: 'Label' },
              { kind: 'text', name: 'value', label: 'Value' },
            ],
          },
        ],
      }}
    />
  );
}
