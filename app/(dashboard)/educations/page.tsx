import type { Metadata } from 'next';
import { getEducations } from '@/app/actions/profile';
import { Section } from '@/components/ui';
import { EducationsScreen } from './educations-screen';

export const metadata: Metadata = { title: 'Educations' };

export default async function EducationsPage() {
  const records = await getEducations();

  return (
    <Section>
      <EducationsScreen records={records} />
    </Section>
  );
}
