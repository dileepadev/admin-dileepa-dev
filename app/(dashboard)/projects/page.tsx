import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getProjects } from '@/app/actions/projects';
import { Section } from '@/components/ui';
import { ProjectsScreen } from './projects-screen';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  // The catalogue is fetched alongside the records rather than after them:
  // it is a second independent read, and serialising it would put a whole
  // round trip between the page and the screen for a panel that is closed.
  const [records, endpoints] = await Promise.all([getProjects(), getApiLink('projects')]);

  return (
    <Section>
      <ProjectsScreen records={records} endpoints={endpoints} />
    </Section>
  );
}
