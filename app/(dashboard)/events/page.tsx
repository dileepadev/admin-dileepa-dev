import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getEvents } from '@/app/actions/events';
import { Section } from '@/components/ui';
import { EventsScreen } from './events-screen';

export const metadata: Metadata = { title: 'Events' };

export default async function EventsPage() {
  // The catalogue is fetched alongside the records rather than after them:
  // it is a second independent read, and serialising it would put a whole
  // round trip between the page and the screen for a panel that is closed.
  const [records, endpoints] = await Promise.all([getEvents(), getApiLink('events')]);

  return (
    <Section>
      <EventsScreen records={records} endpoints={endpoints} />
    </Section>
  );
}
