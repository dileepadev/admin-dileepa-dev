import type { Metadata } from 'next';
import { getDatabaseStatus } from '@/app/actions/maintenance';
import { Section, SectionHeading } from '@/components/ui';
import { DatabaseScreen } from './database-screen';

export const metadata: Metadata = { title: 'Database' };

// Counts change under this screen constantly, and a cached one would be read as
// the state of a database it no longer describes.
export const dynamic = 'force-dynamic';

export default async function DatabasePage() {
  const status = await getDatabaseStatus();

  return (
    <Section>
      <SectionHeading
        label="Database"
        title="Work against production data, without touching it"
        intro="Replaces this development database with a copy of production, so every screen here shows real content. The copy only ever runs in this direction: the API writes to the database it is pointed at and reads from the source, and neither is chosen here."
      />
      <DatabaseScreen status={status} />
    </Section>
  );
}
