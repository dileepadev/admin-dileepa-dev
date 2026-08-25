'use client';

import { deleteBlog, publishBlog, saveBlog } from '@/app/actions/blogs';
import { ResourceManager } from '@/components/resource/ResourceManager';
import type { BlogPost } from '@/lib/types';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 */
export function BlogsScreen({ records }: { records: BlogPost[] }) {
  return (
    <ResourceManager<BlogPost>
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
          cell: (row) => <span className="font-mono">{row.publishedDate?.slice(0, 10)}</span>,
        },
        {
          header: 'Read',
          cell: (row) => <span className="font-mono">{row.readingTimeMinutes} min</span>,
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
              {
                kind: 'checkbox',
                name: 'draft',
                label: 'Draft',
                hint: 'This is the front matter’s word, and it is what decides visibility. A draft is hidden from every public caller.',
              },
            ],
          },
          {
            legend: 'Yours to set',
            note: 'The sync does not touch these.',
            fields: [
              { kind: 'checkbox', name: 'featured', label: 'Feature this post' },
              { kind: 'text', name: 'seo.metaTitle', label: 'Meta title' },
              {
                kind: 'textarea',
                name: 'seo.metaDescription',
                label: 'Meta description',
                wide: true,
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
