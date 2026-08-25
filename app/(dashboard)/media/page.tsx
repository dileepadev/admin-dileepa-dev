import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getImages } from '@/app/actions/upload';
import { ApiEndpoints, Section, SectionHeading } from '@/components/ui';
import { MediaLibrary } from './media-library';

export const metadata: Metadata = { title: 'Media' };

export default async function MediaPage() {
  // `uploads`, not `media`: the screen is named for what a person keeps here
  // and the tag is named for the endpoint it talks to. Showing the screen's own
  // name would defeat the point of showing the endpoint at all.
  const [images, endpoints] = await Promise.all([getImages(), getApiLink('uploads')]);

  return (
    <Section>
      <SectionHeading
        label="Media"
        title="Images"
        intro="Every image the platform serves goes through the API to Cloudinary. This app never holds those credentials — the API is the only thing that does."
      />
      <ApiEndpoints link={endpoints} />
      <MediaLibrary images={images} />
    </Section>
  );
}
