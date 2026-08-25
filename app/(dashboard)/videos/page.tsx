import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getVideos } from '@/app/actions/profile';
import { Section } from '@/components/ui';
import { VideosScreen } from './videos-screen';

export const metadata: Metadata = { title: 'Videos' };

export default async function VideosPage() {
  // The catalogue is fetched alongside the records rather than after them:
  // it is a second independent read, and serialising it would put a whole
  // round trip between the page and the screen for a panel that is closed.
  const [records, endpoints] = await Promise.all([getVideos(), getApiLink('videos')]);

  return (
    <Section>
      <VideosScreen records={records} endpoints={endpoints} />
    </Section>
  );
}
