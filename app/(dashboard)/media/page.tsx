import type { Metadata } from 'next';
import { getImages } from '@/app/actions/upload';
import { Section, SectionHeading } from '@/components/ui';
import { MediaLibrary } from './media-library';

export const metadata: Metadata = { title: 'Media' };

export default async function MediaPage() {
  const images = await getImages();

  return (
    <Section>
      <SectionHeading
        label="Media"
        title="Images"
        intro="Every image the platform serves goes through the API to Cloudinary. This app never holds those credentials — the API is the only thing that does."
      />
      <MediaLibrary images={images} />
    </Section>
  );
}
