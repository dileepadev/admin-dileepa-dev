import type { Metadata } from 'next';
import { getEvents } from '@/app/actions/events';
import { Section } from '@/components/ui';
import { EventsScreen } from './events-screen';

export const metadata: Metadata = { title: 'Events' };

export default async function EventsPage() {
  const records = await getEvents();

  return (
    <Section>
      <EventsScreen records={records} />
    </Section>
  );
}
