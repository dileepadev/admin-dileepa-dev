'use client';

import { deleteEvent, publishEvent, saveEvent } from '@/app/actions/events';
import { ResourceManager } from '@/components/resource/ResourceManager';
import {
  EVENT_FORMATS,
  EVENT_TYPES,
  LINK_KINDS,
  RECORDING_PLATFORMS,
  humanise,
} from '@/lib/constants';
import type { EventRecord } from '@/lib/types';
import { Badge } from '@/components/ui';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 */
export function EventsScreen({ records }: { records: EventRecord[] }) {
  return (
    <ResourceManager<EventRecord>
      label="Event"
      labelPlural="Events"
      intro="Talks, workshops and webinars. Status follows the start date on its own; photos attached here appear in the site's event gallery."
      records={records}
      describe={(row) => row.title}
      save={saveEvent}
      remove={deleteEvent}
      setPublished={publishEvent}
      blank={{
        published: true,
        type: 'talk',
        format: 'in_person',
        timezone: 'Asia/Colombo',
        speakers: [],
        photos: [],
        recordings: [],
        links: [],
      }}
      columns={[
        { header: 'Event', cell: (row) => row.title },
        {
          header: 'When',
          cell: (row) => <span className="font-mono">{row.startAt?.slice(0, 10)}</span>,
        },
        { header: 'Type', cell: (row) => <Badge>{humanise(row.type)}</Badge> },
        {
          header: 'Status',
          cell: (row) => (
            <Badge variant={row.status === 'cancelled' ? 'error' : 'default'}>
              {humanise(row.status)}
            </Badge>
          ),
        },
        {
          header: 'Photos',
          cell: (row) => <span className="font-mono">{row.photos?.length ?? 0}</span>,
        },
      ]}
      schema={{
        sections: [
          {
            legend: 'Event',
            note: 'The slug is the URL. Once an event is published, never change it.',
            fields: [
              {
                kind: 'text',
                name: 'slug',
                label: 'Slug',
                required: true,
                placeholder: '2026-03-14-building-agents',
                hint: 'Lower case, digits and single hyphens.',
              },
              { kind: 'text', name: 'title', label: 'Title', required: true },
              {
                kind: 'textarea',
                name: 'summary',
                label: 'Summary',
                wide: true,
                hint: 'One line. This is what the list and the homepage show.',
              },
              {
                kind: 'textarea',
                name: 'description',
                label: 'Description',
                wide: true,
                hint: 'Blank lines separate paragraphs on the detail page.',
              },
              { kind: 'select', name: 'type', label: 'Type', options: EVENT_TYPES },
              { kind: 'select', name: 'format', label: 'Format', options: EVENT_FORMATS },
              { kind: 'list', name: 'tags', label: 'Tags', wide: true },
            ],
          },
          {
            legend: 'When',
            note: 'Status is derived from the start time. There is nothing to set.',
            fields: [
              { kind: 'datetime', name: 'startAt', label: 'Starts', required: true },
              { kind: 'datetime', name: 'endAt', label: 'Ends' },
              {
                kind: 'text',
                name: 'timezone',
                label: 'Timezone',
                placeholder: 'Asia/Colombo',
              },
              { kind: 'number', name: 'audienceSize', label: 'Audience size' },
            ],
          },
          {
            legend: 'Where',
            note: 'Leave every field empty for an online event — the site reads no location as online.',
            fields: [
              { kind: 'text', name: 'location.venue', label: 'Venue' },
              { kind: 'text', name: 'location.city', label: 'City' },
              { kind: 'text', name: 'location.country', label: 'Country' },
              { kind: 'url', name: 'location.mapUrl', label: 'Map link' },
            ],
          },
          {
            legend: 'Host',
            note: 'The conference, meetup series or programme this ran under — not the event itself.',
            fields: [
              { kind: 'text', name: 'host.name', label: 'Host name' },
              { kind: 'text', name: 'host.organizer', label: 'Organiser' },
              { kind: 'url', name: 'host.organizerUrl', label: 'Organiser website' },
            ],
          },
          {
            legend: 'Slides and cover',
            fields: [
              { kind: 'url', name: 'slides.url', label: 'Slides URL' },
              {
                kind: 'text',
                name: 'slides.provider',
                label: 'Slides host',
                placeholder: 'SpeakerDeck',
              },
              { kind: 'image', name: 'cover.url', label: 'Cover image', folder: 'events' },
              { kind: 'text', name: 'cover.alt', label: 'Cover alt text' },
            ],
          },
          {
            legend: 'Visibility',
            fields: [
              { kind: 'checkbox', name: 'featured', label: 'Feature this event' },
              { kind: 'checkbox', name: 'published', label: 'Show on the site' },
            ],
          },
        ],
        groups: [
          {
            name: 'speakers',
            legend: 'Speaker',
            addLabel: 'Add speaker',
            note: 'Including yourself, if you want the detail page to list you.',
            fields: [
              { kind: 'text', name: 'name', label: 'Name' },
              { kind: 'text', name: 'role', label: 'Role' },
              { kind: 'url', name: 'profileUrl', label: 'Profile URL' },
              { kind: 'url', name: 'avatarUrl', label: 'Avatar URL' },
              { kind: 'checkbox', name: 'isHost', label: 'Hosted the event' },
            ],
          },
          {
            name: 'photos',
            legend: 'Photo',
            addLabel: 'Add photo',
            note: 'These are the site’s event gallery. Alt text is not optional — it is what a screen reader has to work with.',
            fields: [
              { kind: 'image', name: 'url', label: 'Photo', folder: 'events' },
              { kind: 'text', name: 'alt', label: 'Alt text' },
              { kind: 'text', name: 'caption', label: 'Caption' },
              { kind: 'text', name: 'credit', label: 'Credit' },
            ],
          },
          {
            name: 'recordings',
            legend: 'Recording',
            addLabel: 'Add recording',
            fields: [
              { kind: 'select', name: 'platform', label: 'Platform', options: RECORDING_PLATFORMS },
              { kind: 'url', name: 'url', label: 'Watch URL' },
            ],
          },
          {
            name: 'links',
            legend: 'Link',
            addLabel: 'Add link',
            note: 'Registration, an announcement post, a repo, a recap.',
            fields: [
              { kind: 'text', name: 'label', label: 'Label' },
              { kind: 'url', name: 'url', label: 'URL' },
              { kind: 'select', name: 'kind', label: 'Kind', options: LINK_KINDS },
            ],
          },
        ],
      }}
    />
  );
}
