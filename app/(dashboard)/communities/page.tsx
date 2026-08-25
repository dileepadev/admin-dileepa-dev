import type { Metadata } from 'next';
import { getCommunities } from '@/app/actions/profile';
import { Section } from '@/components/ui';
import { CommunitiesScreen } from './communities-screen';

export const metadata: Metadata = { title: 'Communities' };

export default async function CommunitiesPage() {
  const records = await getCommunities();

  return (
    <Section>
      <CommunitiesScreen records={records} />
    </Section>
  );
}
