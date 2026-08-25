import type { Metadata } from 'next';
import { getVideos } from '@/app/actions/profile';
import { Section } from '@/components/ui';
import { VideosScreen } from './videos-screen';

export const metadata: Metadata = { title: 'Videos' };

export default async function VideosPage() {
  const records = await getVideos();

  return (
    <Section>
      <VideosScreen records={records} />
    </Section>
  );
}
