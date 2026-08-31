import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getPillars } from '@/app/actions/profile';
import { Section } from '@/components/ui';
import { PillarsScreen } from './pillars-screen';

export const metadata: Metadata = { title: 'Pillars' };

export default async function PillarsPage() {
  // The catalogue is fetched alongside the records rather than after them:
  // it is a second independent read, and serialising it would put a whole
  // round trip between the page and the screen for a panel that is closed.
  const [records, endpoints] = await Promise.all([getPillars(), getApiLink('pillars')]);

  return (
    <Section>
      <PillarsScreen records={records} endpoints={endpoints} />
    </Section>
  );
}
