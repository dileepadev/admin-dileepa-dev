import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getSpeakingTopics } from '@/app/actions/profile';
import { Section } from '@/components/ui';
import { SpeakingTopicsScreen } from './speaking-topics-screen';

export const metadata: Metadata = { title: 'Speaking topics' };

export default async function SpeakingTopicsPage() {
  const [records, endpoints] = await Promise.all([
    getSpeakingTopics(),
    getApiLink('speaking-topics'),
  ]);

  return (
    <Section>
      <SpeakingTopicsScreen records={records} endpoints={endpoints} />
    </Section>
  );
}
