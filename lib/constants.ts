/**
 * Admin copy and field definitions.
 *
 * Sentence case in every string a person reads — design system §8. An empty
 * state says what would appear and how to make it appear; an error says what
 * failed and what to do about it.
 */

export const APP = {
  name: 'dileepa.dev admin',
  description: 'Content for dileepa.dev, its API, and the blog index.',
  site: 'https://dileepa.dev',
} as const;

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
