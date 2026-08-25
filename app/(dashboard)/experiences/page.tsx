import type { Metadata } from 'next';
import { getExperiences } from '@/app/actions/profile';
import { Section } from '@/components/ui';
import { ExperiencesScreen } from './experiences-screen';

export const metadata: Metadata = { title: 'Experiences' };

export default async function ExperiencesPage() {
  const records = await getExperiences();

  return (
    <Section>
      <ExperiencesScreen records={records} />
    </Section>
  );
}
