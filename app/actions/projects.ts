'use server';

import { z } from 'zod';
import { resource } from '@/lib/api';
import {
  type ActionState,
  flag,
  groups,
  list,
  optional,
  remove as removeResource,
  save,
  setPublished as setPublishedResource,
  text,
} from '@/lib/crud';
import { PROJECT_STATUSES } from '@/lib/constants';
import type { Project } from '@/lib/types';

/**
 * Projects — net-new in v2.0.0.
 *
 * The one screen with no v1 equivalent, so nothing here is a port: it is the
 * `/projects` model as `api-contract.md` §3 defines it.
 */

const optionalUrl = z
  .string()
  .url('That is not a URL. Include https://.')
  .or(z.literal(''))
  .nullable();

const projectSchema = z.object({
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Lower case, digits and single hyphens only — it is the URL.',
    )
    .max(120),
  name: z.string().min(1, 'A name is required.'),
  tagline: z.string(),
  description: z.string(),
  status: z.enum(PROJECT_STATUSES),
  role: z.string().nullable(),
  period: z.object({ start: z.string().nullable(), end: z.string().nullable() }).nullable(),
  stack: z.array(z.string()),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  links: z.object({
    repo: optionalUrl,
    demo: optionalUrl,
    docs: optionalUrl,
    caseStudy: optionalUrl,
    package: optionalUrl,
  }),
  cover: z.object({ url: z.string().url(), alt: z.string() }).nullable(),
  gallery: z.array(
    z.object({
      url: z.string().url('A gallery image needs a full URL.'),
      alt: z.string(),
      caption: z.string().nullable(),
      order: z.number(),
    }),
  ),
  highlights: z.array(z.string()),
  metrics: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })),
  featured: z.boolean(),
  published: z.boolean(),
});

const projectOptions = {
  path: '/projects',
  label: 'Project',
  route: '/projects',
  schema: projectSchema,
  read: (data: FormData) => {
    const start = optional(data, 'period.start');
    const end = optional(data, 'period.end');
    const coverUrl = optional(data, 'cover.url');

    return {
      slug: text(data, 'slug'),
      name: text(data, 'name'),
      tagline: text(data, 'tagline'),
      description: text(data, 'description'),
      status: text(data, 'status'),
      role: optional(data, 'role'),
      period: start || end ? { start, end } : null,
      stack: list(data, 'stack'),
      categories: list(data, 'categories'),
      tags: list(data, 'tags'),
      links: {
        repo: optional(data, 'links.repo'),
        demo: optional(data, 'links.demo'),
        docs: optional(data, 'links.docs'),
        caseStudy: optional(data, 'links.caseStudy'),
        package: optional(data, 'links.package'),
      },
      cover: coverUrl ? { url: coverUrl, alt: text(data, 'cover.alt') } : null,
      gallery: groups(data, 'gallery', (index, get) =>
        get('url')
          ? {
              url: get('url'),
              alt: get('alt'),
              caption: get('caption') || null,
              order: index,
            }
          : null,
      ),
      // One per line rather than comma-separated: a highlight is a sentence,
      // and sentences contain commas.
      highlights: text(data, 'highlights')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      metrics: groups(data, 'metrics', (_index, get) =>
        get('label') && get('value') ? { label: get('label'), value: get('value') } : null,
      ),
      featured: flag(data, 'featured'),
      published: flag(data, 'published'),
    };
  },
};

export async function getProjects(): Promise<Project[]> {
  return (await resource<Project>('/projects').list()).items;
}

export async function getProject(slug: string): Promise<Project | null> {
  try {
    return await resource<Project>('/projects').get(slug);
  } catch {
    return null;
  }
}

export async function saveProject(id: string | null, prevState: ActionState, formData: FormData) {
  return save(projectOptions, id, formData);
}

export async function deleteProject(id: string) {
  return removeResource(projectOptions, id);
}

export async function publishProject(id: string, published: boolean) {
  return setPublishedResource(projectOptions, id, published);
}
