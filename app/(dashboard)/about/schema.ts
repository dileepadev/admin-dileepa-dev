import type { FormSchema } from '@/components/resource/fields';
import { humanise } from '@/lib/constants';

export function aboutSchema(socialFields: readonly string[]): FormSchema {
  return {
    sections: [
      {
        legend: 'Identity',
        note: 'The tagline is the homepage display heading. Everything here is sentence case.',
        fields: [
          { kind: 'text', name: 'name', label: 'Name', required: true },
          {
            kind: 'text',
            name: 'title',
            label: 'Title',
            required: true,
            hint: 'Renders beside the portrait, e.g. "AI engineer".',
          },
          {
            kind: 'text',
            name: 'location',
            label: 'Location',
            hint: 'Shown after the title as "AI engineer · Sri Lanka".',
          },
          {
            kind: 'text',
            name: 'status',
            label: 'Status',
            hint: 'Short and current, e.g. "Open to projects".',
          },
          {
            kind: 'text',
            name: 'tagline',
            label: 'Tagline',
            required: true,
            wide: true,
            hint: 'The display heading on the homepage. One sentence.',
          },
        ],
      },
      {
        legend: 'About copy',
        note: 'One paragraph per block, separated by a blank line. The first is the About section heading; the rest are the prose under it, and the second one is also the hero lead.',
        fields: [
          { kind: 'lines', name: 'description', label: 'Paragraphs', wide: true, required: true },
          {
            kind: 'lines',
            name: 'connect',
            label: 'Contact copy',
            wide: true,
            hint: 'Shown on the contact section. One paragraph per block.',
          },
        ],
      },
      {
        legend: 'Images',
        note: 'The portrait is one of only two places a photograph appears on the site. Cloudinary URLs.',
        fields: [
          {
            kind: 'image',
            name: 'images.profileWebp',
            label: 'Portrait (WebP)',
            folder: 'about',
          },
          {
            kind: 'image',
            name: 'images.profilePng',
            label: 'Portrait (PNG fallback)',
            folder: 'about',
          },
          {
            kind: 'image',
            name: 'images.bannerWebp',
            label: 'Banner',
            folder: 'about',
            hint: 'Not rendered on the site — kept for off-platform use.',
          },
        ],
      },
      {
        legend: 'Links',
        note: 'The footer renders an icon for each of these that has a URL.',
        fields: socialFields.map((key) => ({
          kind: key === 'email' ? ('email' as const) : ('url' as const),
          name: `links.${key}`,
          label: humanise(key === 'xtwitter' ? 'X' : key),
        })),
      },
    ],
  };
}
