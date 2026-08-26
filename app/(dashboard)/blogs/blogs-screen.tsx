'use client';

import { deleteBlog, publishBlog, saveBlog } from '@/app/actions/blogs';
import { ResourceManager } from '@/components/resource/ResourceManager';
import type { ApiLink, BlogPost } from '@/lib/types';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 */
export function BlogsScreen({
  records,
  endpoints,
}: {
  records: BlogPost[];
  endpoints?: ApiLink | null;
}) {
  return (
    <ResourceManager<BlogPost>
      endpoints={endpoints}
      label="Blog post"
      labelPlural="Blogs"
      intro="Metadata for every post on dileepa.dev/blog."
      records={records}
      describe={(row) => row.title}
      save={saveBlog}
      remove={deleteBlog}
      setPublished={publishBlog}
      blank={{ published: true, draft: false, tags: [] }}
      columns={[
        { header: 'Title', cell: (row) => row.title },
        {
          header: 'Published',
          nowrap: true,
          cell: (row) => <span className="font-mono">{row.publishedDate?.slice(0, 10)}</span>,
        },
        {
          header: 'Read',
          nowrap: true,
          cell: (row) => <span className="font-mono">{row.readingTimeMinutes} min</span>,
        },
        // Readers write these two, not the admin. They are shown because
        // knowing a post landed is the point of collecting them, and there is
        // no form field for either — the API refuses them on write.
        {
          header: 'Views',
          nowrap: true,
          cell: (row) => (
            <span className="font-mono tabular-nums">{(row.views ?? 0).toLocaleString()}</span>
          ),
        },
        {
          header: 'Reactions',
          nowrap: true,
          cell: (row) => {
            const total = Object.values(row.reactions ?? {}).reduce(
              (sum, count) => sum + (count ?? 0),
              0,
            );
            return <span className="font-mono tabular-nums">{total}</span>;
          },
        },
      ]}
      schema={{
        sections: [
          {
            legend: 'From the front matter',
            note: 'Written by the sync on every push. Change these in the Markdown, not here.',
            fields: [
              {
                kind: 'text',
                name: 'slug',
                label: 'Slug',
                required: true,
                hint: 'The URL. A published slug is never renamed — there is no way to notice the break from inside the blog repo.',
              },
              { kind: 'text', name: 'title', label: 'Title', required: true },
              { kind: 'textarea', name: 'description', label: 'Description', wide: true },
              { kind: 'date', name: 'publishedDate', label: 'Published', required: true },
              { kind: 'date', name: 'updatedDate', label: 'Updated' },
              { kind: 'list', name: 'tags', label: 'Tags', wide: true },
              { kind: 'text', name: 'series.name', label: 'Series' },
              { kind: 'number', name: 'series.order', label: 'Part number' },
              { kind: 'number', name: 'readingTimeMinutes', label: 'Reading time (minutes)' },
            ],
          },
          {
            legend: 'Visibility',
            note: '“Draft” comes from the front matter and is rewritten on every push; “featured” is yours and the sync never touches it. They are together because they answer the same question — who can see this, and where.',
            fields: [
              {
                kind: 'checkbox',
                name: 'draft',
                label: 'Draft',
                hint: 'The front matter’s word, and what decides visibility. A draft is hidden from every public caller.',
              },
              { kind: 'checkbox', name: 'featured', label: 'Feature this post' },
            ],
          },
          {
            legend: 'SEO',
            note: 'Yours to set. The sync does not touch these.',
            fields: [
              { kind: 'text', name: 'seo.metaTitle', label: 'Meta title', wide: true },
              {
                kind: 'textarea',
                name: 'seo.metaDescription',
                label: 'Meta description',
                wide: true,
                rows: 3,
              },
              {
                kind: 'url',
                name: 'seo.ogImage',
                label: 'Social card image',
                wide: true,
                hint: 'Optional. Without one, the site’s default card is used.',
              },
            ],
          },
        ],
      }}
    />
  );
}
