import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getExperiences } from '@/app/actions/profile';
import { Section } from '@/components/ui';
import { ExperiencesScreen } from './experiences-screen';

export const metadata: Metadata = { title: 'Experiences' };

export default async function ExperiencesPage() {
  // The catalogue is fetched alongside the records rather than after them:
  // it is a second independent read, and serialising it would put a whole
  // round trip between the page and the screen for a panel that is closed.
  const [records, endpoints] = await Promise.all([getExperiences(), getApiLink('experiences')]);

  return (
    <Section>
      <ExperiencesScreen records={records} endpoints={endpoints} />
    </Section>
  );
}
