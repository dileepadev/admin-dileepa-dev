import type { Metadata } from 'next';
import { getAbout, saveAbout } from '@/app/actions/profile';
import { SingletonManager } from '@/components/resource/ResourceManager';
import { EmptyState, Section } from '@/components/ui';
import { SOCIAL_FIELDS } from '@/lib/constants';
import { aboutSchema } from './schema';

export const metadata: Metadata = { title: 'About' };

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <Section>
      {about ? (
        <SingletonManager
          label="About"
          title="About"
          intro="The homepage hero and the About section read from this record. The first paragraph is the section heading; the rest are its body."
          record={about}
          schema={aboutSchema(SOCIAL_FIELDS)}
          save={saveAbout}
        />
      ) : (
        <EmptyState
          title="The about record could not be read."
          hint="The API did not answer. Check that it is running on the port API_URL names, and reload."
        />
      )}
    </Section>
  );
}
