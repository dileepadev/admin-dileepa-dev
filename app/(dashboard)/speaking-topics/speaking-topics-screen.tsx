'use client';

import {
  deleteSpeakingTopic,
  publishSpeakingTopic,
  reorderSpeakingTopics,
  saveSpeakingTopic,
} from '@/app/actions/profile';
import { ResourceManager } from '@/components/resource/ResourceManager';
import type { ApiLink, SpeakingTopic } from '@/lib/types';

/**
 * The screen, as a client component.
 *
 * Same shape as every other collection here; see `pillars-screen.tsx` for why
 * the fetch stays on the server and the description lives in the client.
 */
export function SpeakingTopicsScreen({
  records,
  endpoints,
}: {
  records: SpeakingTopic[];
  endpoints?: ApiLink | null;
}) {
  return (
    <ResourceManager<SpeakingTopic>
      endpoints={endpoints}
      label="Speaking topic"
      labelPlural="Speaking topics"
      intro="The sessions and talks section of the speaker kit at dileepa.dev/profile — what an event organiser can book you to present. Keep it to what you would actually deliver this season, in the order below."
      records={records}
      describe={(row) => row.title}
      save={saveSpeakingTopic}
      remove={deleteSpeakingTopic}
      setPublished={publishSpeakingTopic}
      reorder={reorderSpeakingTopics}
      blank={{ published: true }}
      columns={[{ header: 'Title', cell: (row) => row.title }]}
      schema={{
        sections: [
          {
            legend: 'Session',
            note: 'The title is the name of the talk as it would appear on an agenda. The summary is the abstract under it — two sentences, not a paragraph.',
            fields: [
              { kind: 'text', name: 'title', label: 'Title', required: true, wide: true },
              {
                kind: 'textarea',
                name: 'summary',
                label: 'Summary',
                required: true,
                wide: true,
                rows: 4,
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
