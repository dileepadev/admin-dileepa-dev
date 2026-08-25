'use server';

import { z } from 'zod';
import { resource } from '@/lib/api';
import {
  type ActionState,
  flag,
  list,
  number,
  optional,
  remove as removeResource,
  save,
  setPublished as setPublishedResource,
  text,
} from '@/lib/crud';
import type { BlogPost } from '@/lib/types';

/**
 * Blog posts — metadata only.
 *
 * **The words live in Git.** `blog-dileepa-dev` holds the Markdown and
 * `POST /blogs/sync` writes the index here on every push, so almost everything
 * on this screen is written by the pipeline rather than by hand. Editing a
 * title here and not in the front matter means the next sync overwrites it.
 * The screen says so.
 *
 * What is genuinely editable by hand is the part the front matter does not
 * carry: `featured`, `order`, and the SEO overrides.
 *
 * There is no banner. Posts carry no image of their own — anything a post shows
 * is an ordinary Markdown image in the body pointing at a URL. The field is
 * still on the API model, and is deliberately never written.
 */

const blogSchema = z.object({
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Lower case, digits and single hyphens only — it is the URL, and a published one is never renamed.',
    )
    .max(160),
  title: z.string().min(1, 'A title is required.'),
  description: z.string(),
  publishedDate: z.string().min(1, 'A publication date is required.'),
  updatedDate: z.string().nullable(),
  tags: z.array(z.string()),
  series: z.object({ name: z.string().min(1), order: z.number() }).nullable(),
  readingTimeMinutes: z.number().nullable(),
  draft: z.boolean(),
  featured: z.boolean(),
  published: z.boolean(),
  seo: z.object({
    metaTitle: z.string().nullable(),
    metaDescription: z.string().nullable(),
    ogImage: z.string().url('That is not a URL.').or(z.literal('')).nullable(),
  }),
});

const blogOptions = {
  path: '/blogs',
  label: 'Blog post',
  route: '/blogs',
  schema: blogSchema,
  read: (data: FormData) => {
    const seriesName = optional(data, 'series.name');
    return {
      slug: text(data, 'slug'),
      title: text(data, 'title'),
      description: text(data, 'description'),
      publishedDate: text(data, 'publishedDate'),
      updatedDate: optional(data, 'updatedDate'),
      tags: list(data, 'tags'),
      series: seriesName ? { name: seriesName, order: number(data, 'series.order') ?? 0 } : null,
      readingTimeMinutes: number(data, 'readingTimeMinutes'),
      draft: flag(data, 'draft'),
      featured: flag(data, 'featured'),
      // `draft` is the author's word, in the front matter; `published` is the
      // platform's visibility flag. The sync maps one to the other, and a hand
      // edit here should not be able to make them disagree.
      published: !flag(data, 'draft'),
      seo: {
        metaTitle: optional(data, 'seo.metaTitle'),
        metaDescription: optional(data, 'seo.metaDescription'),
        ogImage: optional(data, 'seo.ogImage'),
      },
    };
  },
};

export async function getBlogs(): Promise<BlogPost[]> {
  return (await resource<BlogPost>('/blogs').list()).items;
}

export async function getBlog(slug: string): Promise<BlogPost | null> {
  try {
    return await resource<BlogPost>('/blogs').get(slug);
  } catch {
    return null;
  }
}

export async function saveBlog(id: string | null, prevState: ActionState, formData: FormData) {
  return save(blogOptions, id, formData);
}

export async function deleteBlog(id: string) {
  return removeResource(blogOptions, id);
}

export async function publishBlog(id: string, published: boolean) {
  return setPublishedResource(blogOptions, id, published);
}
