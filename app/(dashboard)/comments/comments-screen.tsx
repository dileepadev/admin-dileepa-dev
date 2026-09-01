'use client';

import { deleteComment, publishComment, saveComment } from '@/app/actions/comments';
import { ResourceManager } from '@/components/resource/ResourceManager';
import type { ApiLink, Comment } from '@/lib/types';

/**
 * The screen, as a client component.
 *
 * `columns[].cell` and `describe` are functions, and a function cannot cross
 * the server-to-client boundary. So the fetch stays on the server in
 * `page.tsx` and everything that describes the screen lives here.
 */
export function CommentsScreen({
  records,
  endpoints,
}: {
  records: Comment[];
  endpoints?: ApiLink | null;
}) {
  return (
    <ResourceManager<Comment>
      endpoints={endpoints}
      label="Comment"
      labelPlural="Comments"
      intro="Reader comments on blog posts. They go live the moment they are posted — there is no approval queue, so this screen is for what comes after. Hiding is reversible and keeps the replies underneath addressable; deleting is not."
      records={records}
      describe={(row) => `${row.author} on ${row.slug}`}
      save={saveComment}
      remove={deleteComment}
      setPublished={publishComment}
      blank={{ published: true, authorIsOwner: true }}
      columns={[
        { header: 'Author', cell: (row) => row.author },
        {
          header: 'Comment',
          cell: (row) => <span className="line-clamp-2">{row.body}</span>,
        },
        {
          header: 'Post',
          cell: (row) => <span className="text-fg-muted font-mono">{row.slug}</span>,
        },
        {
          header: 'Posted',
          nowrap: true,
          cell: (row) => <span className="font-mono">{row.createdAt?.slice(0, 10) ?? '—'}</span>,
        },
        {
          header: 'Reactions',
          nowrap: true,
          cell: (row) => {
            const total = Object.values(row.reactions ?? {}).reduce(
              (sum, count) => sum + (count ?? 0),
              0,
            );
            return <span className="font-mono tabular-nums">{total}</span>;
          },
        },
        {
          header: 'Type',
          nowrap: true,
          cell: (row) =>
            row.parentId ? (
              <span className="text-fg-muted">Reply</span>
            ) : (
              <span className="text-fg-muted">Comment</span>
            ),
        },
      ]}
      schema={{
        sections: [
          {
            legend: 'Comment',
            note: 'Creating one here posts it as you — it renders with an "Author" badge on the site. This is the only way to get that badge; a reader cannot claim it.',
            fields: [
              {
                kind: 'text',
                name: 'slug',
                label: 'Post slug',
                required: true,
                hint: 'Which post this belongs to, e.g. 2026-08-06-part-1-kicking-off-the-series.',
              },
              { kind: 'text', name: 'author', label: 'Name', required: true },
              {
                kind: 'textarea',
                name: 'body',
                label: 'Comment',
                required: true,
                wide: true,
                rows: 5,
              },
              {
                kind: 'text',
                name: 'parentId',
                label: 'In reply to',
                hint: 'The id of the comment being replied to. Leave empty for a top-level comment — depth is capped at one, so a reply to a reply joins the same thread.',
              },
            ],
          },
          {
            legend: 'Visibility',
            note: 'Hiding takes a comment off the site and keeps the row. Replies underneath survive — the API promotes an orphaned reply to top level rather than losing it with its parent.',
            fields: [
              { kind: 'checkbox', name: 'published', label: 'Show on the site', wide: true },
            ],
          },
        ],
      }}
    />
  );
}
