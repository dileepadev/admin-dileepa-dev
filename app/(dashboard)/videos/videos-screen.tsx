'use client';

import { deleteVideo, publishVideo, saveVideo } from '@/app/actions/profile';
import { ResourceManager } from '@/components/resource/ResourceManager';
import type { Video } from '@/lib/types';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 */
export function VideosScreen({ records }: { records: Video[] }) {
  return (
    <ResourceManager<Video>
      label="Video"
      labelPlural="Videos"
      intro="Short walkthroughs and recorded talks. The site lists the title and date and links out — it does not render thumbnails."
      records={records}
      describe={(row) => row.title}
      save={saveVideo}
      remove={deleteVideo}
      setPublished={publishVideo}
      blank={{ published: true }}
      columns={[
        { header: 'Title', cell: (row) => row.title },
        { header: 'Date', cell: (row) => <span className="font-mono">{row.date}</span> },
      ]}
      schema={{
        sections: [
          {
            legend: 'Video',
            fields: [
              { kind: 'text', name: 'title', label: 'Title', required: true, wide: true },
              { kind: 'date', name: 'date', label: 'Published', required: true },
              { kind: 'url', name: 'link', label: 'Watch URL', required: true },
              {
                kind: 'url',
                name: 'thumbnail',
                label: 'Thumbnail URL',
                wide: true,
                hint: 'Stored but no longer rendered. Photographs appear in two places on the site: the hero portrait and the event gallery.',
              },
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
