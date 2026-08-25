'use server';

import { z } from 'zod';
import { resource } from '@/lib/api';
import {
  type ActionState,
  flag,
  groups,
  list,
  number,
  optional,
  remove as removeResource,
  save,
  setPublished as setPublishedResource,
  text,
} from '@/lib/crud';
import { EVENT_FORMATS, EVENT_TYPES, LINK_KINDS, RECORDING_PLATFORMS } from '@/lib/constants';
import type { EventRecord } from '@/lib/types';

/**
 * Events — talks, workshops and webinars.
 *
 * The v1 model had seven flat fields and no slug, no structured time, no
 * speakers, photos or recordings. This is the v2 shape, and most of the length
 * below is the four repeatable groups it added.
 *
 * `status` is deliberately not written on create or update. The API derives it
 * from `startAt`, so an event that has happened says so without anyone
 * remembering to edit it. Cancelling is a separate action, because it is the
 * one status a human genuinely decides.
 */

const optionalUrl = z
  .string()
  .url('That is not a URL. Include https://.')
  .or(z.literal(''))
  .nullable();

const eventSchema = z.object({
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Lower case, digits and single hyphens only — it is the URL.',
    )
    .max(140),
  title: z.string().min(1, 'A title is required.'),
  summary: z.string(),
  description: z.string(),
  type: z.enum(EVENT_TYPES),
  format: z.enum(EVENT_FORMATS),
  startAt: z.string().min(1, 'A start date and time is required.'),
  endAt: z.string().nullable(),
  timezone: z.string().min(1),
  location: z
    .object({
      venue: z.string().nullable(),
      city: z.string().nullable(),
      country: z.string().nullable(),
      mapUrl: optionalUrl,
    })
    .nullable(),
  host: z
    .object({
      name: z.string().min(1),
      organizer: z.string().nullable(),
      organizerUrl: optionalUrl,
    })
    .nullable(),
  speakers: z.array(
    z.object({
      name: z.string().min(1),
      role: z.string().nullable(),
      profileUrl: optionalUrl,
      avatarUrl: optionalUrl,
      isHost: z.boolean(),
    }),
  ),
  photos: z.array(
    z.object({
      url: z.string().url('A photo needs a full URL.'),
      alt: z.string(),
      caption: z.string().nullable(),
      credit: z.string().nullable(),
      order: z.number(),
    }),
  ),
  recordings: z.array(
    z.object({
      platform: z.enum(RECORDING_PLATFORMS),
      url: z.string().url('A recording needs a full URL.'),
    }),
  ),
  links: z.array(
    z.object({
      label: z.string().min(1),
      url: z.string().url('A link needs a full URL.'),
      kind: z.enum(LINK_KINDS),
    }),
  ),
  slides: z.object({ url: z.string().url(), provider: z.string().nullable() }).nullable(),
  cover: z.object({ url: z.string().url(), alt: z.string() }).nullable(),
  tags: z.array(z.string()),
  audienceSize: z.number().nullable(),
  featured: z.boolean(),
  published: z.boolean(),
});

const eventOptions = {
  path: '/events',
  label: 'Event',
  route: '/events',
  schema: eventSchema,
  read: (data: FormData) => {
    const venue = optional(data, 'location.venue');
    const city = optional(data, 'location.city');
    const country = optional(data, 'location.country');
    const mapUrl = optional(data, 'location.mapUrl');
    const hostName = optional(data, 'host.name');
    const slidesUrl = optional(data, 'slides.url');
    const coverUrl = optional(data, 'cover.url');

    return {
      slug: text(data, 'slug'),
      title: text(data, 'title'),
      summary: text(data, 'summary'),
      description: text(data, 'description'),
      type: text(data, 'type'),
      format: text(data, 'format'),
      startAt: text(data, 'startAt'),
      endAt: optional(data, 'endAt'),
      timezone: text(data, 'timezone') || 'Asia/Colombo',
      // An entirely blank location is `null`, not an object of nulls. The site
      // reads "no location" as "online", and `{}` is not that.
      location: venue || city || country || mapUrl ? { venue, city, country, mapUrl } : null,
      host: hostName
        ? {
            name: hostName,
            organizer: optional(data, 'host.organizer'),
            organizerUrl: optional(data, 'host.organizerUrl'),
          }
        : null,
      speakers: groups(data, 'speakers', (index, get) =>
        get('name')
          ? {
              name: get('name'),
              role: get('role') || null,
              profileUrl: get('profileUrl') || null,
              avatarUrl: get('avatarUrl') || null,
              isHost: data.get(`speakers.${index}.isHost`) === 'on',
            }
          : null,
      ),
      photos: groups(data, 'photos', (index, get) =>
        get('url')
          ? {
              url: get('url'),
              alt: get('alt'),
              caption: get('caption') || null,
              credit: get('credit') || null,
              order: index,
            }
          : null,
      ),
      recordings: groups(data, 'recordings', (_index, get) =>
        get('url') ? { platform: get('platform') || 'other', url: get('url') } : null,
      ),
      links: groups(data, 'links', (_index, get) =>
        get('url') && get('label')
          ? { label: get('label'), url: get('url'), kind: get('kind') || 'resource' }
          : null,
      ),
      slides: slidesUrl ? { url: slidesUrl, provider: optional(data, 'slides.provider') } : null,
      cover: coverUrl ? { url: coverUrl, alt: text(data, 'cover.alt') } : null,
      tags: list(data, 'tags'),
      audienceSize: number(data, 'audienceSize'),
      featured: flag(data, 'featured'),
      published: flag(data, 'published'),
    };
  },
};

export async function getEvents(): Promise<EventRecord[]> {
  return (await resource<EventRecord>('/events').list()).items;
}

export async function getEvent(slug: string): Promise<EventRecord | null> {
  try {
    return await resource<EventRecord>('/events').get(slug);
  } catch {
    return null;
  }
}

export async function saveEvent(id: string | null, prevState: ActionState, formData: FormData) {
  return save(eventOptions, id, formData);
}

export async function deleteEvent(id: string) {
  return removeResource(eventOptions, id);
}

export async function publishEvent(id: string, published: boolean) {
  return setPublishedResource(eventOptions, id, published);
}

/**
 * Cancelling is its own action.
 *
 * `status` is derived from `startAt` everywhere else, and `cancelled` is the
 * one value a person decides rather than the clock. Setting it back to `null`
 * hands the event to the clock again.
 */
export async function cancelEvent(id: string, cancelled: boolean): Promise<ActionState> {
  try {
    await resource<EventRecord>('/events').update(id, {
      status: cancelled ? 'cancelled' : null,
    });
  } catch {
    return { message: 'Could not change the status. The API did not answer.' };
  }
  return {
    success: true,
    message: cancelled ? 'Event marked cancelled.' : 'Status follows the start date again.',
  };
}
