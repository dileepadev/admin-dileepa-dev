import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getCommunities } from '@/app/actions/profile';
import { Section } from '@/components/ui';
import { CommunitiesScreen } from './communities-screen';

export const metadata: Metadata = { title: 'Communities' };

export default async function CommunitiesPage() {
  // The catalogue is fetched alongside the records rather than after them:
  // it is a second independent read, and serialising it would put a whole
  // round trip between the page and the screen for a panel that is closed.
  const [records, endpoints] = await Promise.all([getCommunities(), getApiLink('communities')]);

  return (
    <Section>
      <CommunitiesScreen records={records} endpoints={endpoints} />
    </Section>
  );
}
