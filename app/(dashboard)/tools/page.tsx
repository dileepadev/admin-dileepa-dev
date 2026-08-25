import type { Metadata } from 'next';
import { getTools } from '@/app/actions/profile';
import { Section } from '@/components/ui';
import { ToolsScreen } from './tools-screen';

export const metadata: Metadata = { title: 'Tools' };

export default async function ToolsPage() {
  const records = await getTools();

  return (
    <Section>
      <ToolsScreen records={records} />
    </Section>
  );
}
