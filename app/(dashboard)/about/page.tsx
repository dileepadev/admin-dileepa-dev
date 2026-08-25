import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getAbout, saveAbout } from '@/app/actions/profile';
import { SingletonManager } from '@/components/resource/ResourceManager';
import { EmptyState, Section } from '@/components/ui';
import { SOCIAL_FIELDS } from '@/lib/constants';
import { aboutSchema } from './schema';

export const metadata: Metadata = { title: 'About' };

export default async function AboutPage() {
  const [about, endpoints] = await Promise.all([getAbout(), getApiLink('about')]);

  return (
    <Section>
      {about ? (
        <SingletonManager
          label="About"
          title="About"
          intro="The homepage hero and the About section both read from this record — one request, no second call for the line under the tagline."
          record={about}
          schema={aboutSchema(SOCIAL_FIELDS)}
          save={saveAbout}
          endpoints={endpoints}
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
