import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getComments } from '@/app/actions/comments';
import { Section } from '@/components/ui';
import { CommentsScreen } from './comments-screen';

export const metadata: Metadata = { title: 'Comments' };

export default async function CommentsPage() {
  const [records, endpoints] = await Promise.all([getComments(), getApiLink('comments')]);

  return (
    <Section>
      <CommentsScreen records={records} endpoints={endpoints} />
    </Section>
  );
}
