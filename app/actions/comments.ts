'use server';

import { z } from 'zod';
import {
  type ActionState,
  flag,
  optional,
  readList,
  remove as removeResource,
  save,
  setPublished as setPublishedResource,
  text,
} from '@/lib/crud';
import type { Comment } from '@/lib/types';

/**
 * Blog comments — moderation, and the author's own replies.
 *
 * **Readers post from the website**, and their comments are live immediately;
 * there is no approval queue. This screen is what comes after: hiding one,
 * correcting one, deleting one — and replying.
 *
 * A comment created here is marked `authorIsOwner` and renders with an "Author"
 * badge on the site. That is the only way to get the badge: the public endpoint
 * takes a model with no such field, so a reader cannot claim it.
 *
 * Hiding is the usual action. It sets `published: false`, which takes the
 * comment off the site while leaving the row — and, importantly, leaving the
 * replies underneath it addressable. The API promotes an orphaned reply to top
 * level rather than losing it with its parent, because the person who wrote the
 * reply is not responsible for the comment above it.
 *
 * `email` is shown here and nowhere else. The public endpoint returns a
 * different model that has no field for it.
 */

const commentSchema = z.object({
  slug: z.string().min(1, 'Which post is this on?'),
  author: z.string().min(1, 'A name is required.').max(80),
  body: z.string().min(1, 'A comment cannot be empty.').max(4000),
  parentId: z.string().nullable(),
  published: z.boolean(),
});

const commentOptions = {
  path: '/comments',
  label: 'Comment',
  route: '/comments',
  schema: commentSchema,
  read: (data: FormData) => ({
    slug: text(data, 'slug'),
    author: text(data, 'author'),
    body: text(data, 'body'),
    parentId: optional(data, 'parentId'),
    published: flag(data, 'published'),
  }),
};

export async function getComments(): Promise<Comment[]> {
  // Newest first, and hidden ones included — this is a queue, and the thing
  // most likely to need attention is the thing that just arrived.
  return readList<Comment>('/comments', 'comments');
}

export async function saveComment(id: string | null, prevState: ActionState, formData: FormData) {
  return save(commentOptions, id, formData);
}

export async function deleteComment(id: string) {
  return removeResource(commentOptions, id);
}

export async function publishComment(id: string, published: boolean) {
  return setPublishedResource(commentOptions, id, published);
}
