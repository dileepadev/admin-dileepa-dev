/**
 * Admin copy and field definitions.
 *
 * Sentence case in every string a person reads — design system §8. An empty
 * state says what would appear and how to make it appear; an error says what
 * failed and what to do about it.
 */

import packageJson from '@/package.json';
import type { PillarIcon } from '@/lib/types';

export const APP = {
  name: 'dileepa.dev admin',
  description: 'Content for dileepa.dev, its API, and the blog index.',
  site: 'https://dileepa.dev',
  version: packageJson.version,
} as const;

/**
 * What `POST /uploads` accepts, and the one place that list is written.
 *
 * It has to match `ALLOWED_MIME_TYPES` in the API's `app/services/images.py`.
 * The API is the authority — it re-checks every upload — but a file rejected
 * here is rejected before it is sent, which is the difference between an
 * instant "not an image" and a ten-megabyte round trip that ends in one.
 *
 * Both JPEG spellings are covered by a single MIME type: `image/jpeg` is what
 * a browser reports for `.jpg` and `.jpeg` alike. The extensions are listed in
 * `accept` anyway, because some platforms hand a file picker an empty type and
 * fall back to matching the name.
 */
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

/** The `accept` attribute for any file input that takes an image. */
export const IMAGE_ACCEPT = [...IMAGE_MIME_TYPES, '.jpg', '.jpeg'].join(',');

/** How the accepted formats are named to a person, in one sentence. */
export const IMAGE_FORMATS = 'JPG, JPEG, PNG, WebP, GIF or SVG';

/** The largest upload the API will take, in bytes. Mirrors `MAX_BYTES`. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * The portrait fields on the about record, most preferred first.
 *
 * The site picks the first one that has a value — `portrait()` in
 * `dileepa-dev/lib/format.ts` — so this order is the site's order, and the
 * labels say so rather than calling two of the three a "fallback".
 */
export const PORTRAIT_FIELDS = [
  { name: 'images.profileWebp', label: 'Portrait (WebP)' },
  { name: 'images.profileJpg', label: 'Portrait (JPG)' },
  { name: 'images.profilePng', label: 'Portrait (PNG)' },
] as const;

/** The social fields on the about record, in the order the footer renders them. */
export const SOCIAL_FIELDS = [
  'website',
  'email',
  'github',
  'linkedin',
  'xtwitter',
  'instagram',
  'youtube',
  'facebook',
] as const;

/**
 * The icon names a pillar card may use, in the order the select offers them.
 *
 * The API's `PillarIcon` is the authority — it is a closed set in the spec, and
 * `PILLAR_ICONS satisfies readonly PillarIcon[]` is what makes a name this list
 * invents fail to compile rather than become a 422 on save. The public site
 * resolves each of these to an imported icon component.
 */
export const PILLAR_ICONS = [
  'cpu',
  'code',
  'mic',
  'book',
  'video',
  'users',
  'sparkles',
  'rocket',
  'terminal',
  'pen',
  'globe',
  'graduation-cap',
] as const satisfies readonly PillarIcon[];

export const EVENT_TYPES = [
  'talk',
  'workshop',
  'webinar',
  'meetup',
  'bootcamp',
  'panel',
  'other',
] as const;

export const EVENT_FORMATS = ['in_person', 'online', 'hybrid'] as const;

export const PROJECT_STATUSES = ['active', 'maintained', 'archived', 'concept'] as const;

export const RECORDING_PLATFORMS = ['youtube', 'linkedin', 'other'] as const;

export const LINK_KINDS = ['registration', 'announcement', 'repo', 'resource', 'recap'] as const;

export const PROJECT_LINK_FIELDS = ['repo', 'demo', 'docs', 'caseStudy', 'package'] as const;

/** Sentence-cases an enum value for display: `in_person` → "In person". */
export function humanise(value: string | null | undefined): string {
  if (!value) return '';
  const words = value.replace(/[_-]+/g, ' ').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
