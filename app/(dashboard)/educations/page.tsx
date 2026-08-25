import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getEducations } from '@/app/actions/profile';
import { Section } from '@/components/ui';
import { EducationsScreen } from './educations-screen';

export const metadata: Metadata = { title: 'Educations' };

export default async function EducationsPage() {
  // The catalogue is fetched alongside the records rather than after them:
  // it is a second independent read, and serialising it would put a whole
  // round trip between the page and the screen for a panel that is closed.
  const [records, endpoints] = await Promise.all([getEducations(), getApiLink('educations')]);

  return (
    <Section>
      <EducationsScreen records={records} endpoints={endpoints} />
    </Section>
  );
}
