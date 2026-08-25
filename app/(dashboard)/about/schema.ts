import type { FormSchema } from '@/components/resource/fields';
import { PORTRAIT_FIELDS, humanise } from '@/lib/constants';

export function aboutSchema(socialFields: readonly string[]): FormSchema {
  return {
    sections: [
      {
        legend: 'Identity',
        note: 'Everything here is sentence case.',
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
        ],
      },
      {
        legend: 'Hero',
        note: 'The two lines at the top of the homepage, and the only two. The site reads both from this record in one request — the supporting line used to be borrowed from the second About paragraph, so editing the About copy moved it.',
        fields: [
          {
            kind: 'text',
            name: 'tagline',
            label: 'Tagline',
            required: true,
            wide: true,
            hint: 'The display heading. One sentence, and the largest type on the site.',
          },
          {
            kind: 'textarea',
            name: 'taglineDescription',
            label: 'Tagline description',
            wide: true,
            rows: 3,
            hint: 'The supporting line under it. One or two sentences — it sits above the buttons, not in place of the About section.',
          },
        ],
      },
      {
        legend: 'About copy',
        note: 'One paragraph per block, separated by a blank line. The first is the About section heading; the rest are the prose under it.',
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
        legend: 'Portrait',
        note: 'One of only two places a photograph appears on the site. Upload whichever formats you have — the site takes the first one that is set, in the order below, and does not convert between them. WebP is the smallest; JPG is what a camera gives you; PNG is the lossless original.',
        fields: PORTRAIT_FIELDS.map((portrait) => ({
          kind: 'image' as const,
          name: portrait.name,
          label: portrait.label,
          folder: 'about',
        })),
      },
      {
        legend: 'Other images',
        fields: [
          {
            kind: 'image',
            name: 'images.bannerWebp',
            label: 'Banner',
            folder: 'about',
            wide: true,
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
