import type { Metadata } from 'next';
import { getProjects } from '@/app/actions/projects';
import { Section } from '@/components/ui';
import { ProjectsScreen } from './projects-screen';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  const records = await getProjects();

  return (
    <Section>
      <ProjectsScreen records={records} />
    </Section>
  );
}
