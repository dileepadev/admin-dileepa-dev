'use server';

import { z } from 'zod';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

const isValidUrl = (value: unknown) => {
  if (!value || typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const urlField = (message: string) => z.string().refine(isValidUrl, { message });

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const emailField = (message: string) => z.string().refine(isValidEmail, { message });

const aboutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  description: z
    .array(z.string().min(1, 'Description paragraph cannot be empty'))
    .min(1, 'At least one description is required'),
  bannerWebp: urlField('Invalid banner WebP URL'),
  profilePng: urlField('Invalid profile PNG URL'),
  profileWebp: urlField('Invalid profile WebP URL'),
  website: urlField('Invalid website URL'),
  email: emailField('Invalid email'),
  github: urlField('Invalid GitHub URL'),
  linkedin: urlField('Invalid LinkedIn URL'),
  xtwitter: urlField('Invalid X/Twitter URL'),
  instagram: urlField('Invalid Instagram URL'),
  youtube: urlField('Invalid YouTube URL'),
  // facebook is required
  facebook: urlField('Invalid Facebook URL'),
  connect: z
    .array(z.string().min(1, 'Connect message cannot be empty'))
    .min(1, 'At least one connect message is required'),
});

export type AboutFormData = z.infer<typeof aboutSchema>;

export async function getAboutData(): Promise<AboutFormData | null> {
  const session = await getSession();
  if (!session) return null;

  const API_URL = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${API_URL}/about`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch about data:', response.statusText);
      return null;
    }

    const data = await response.json();

    // Transform the nested structure to flat form data
    return {
      name: data.name,
      title: data.title,
      tagline: data.tagline,
      description: data.description,
      bannerWebp: data.images.bannerWebp,
      profilePng: data.images.profilePng,
      profileWebp: data.images.profileWebp,
      website: data.links.website,
      email: data.links.email,
      github: data.links.github,
      linkedin: data.links.linkedin,
      xtwitter: data.links.xtwitter,
      instagram: data.links.instagram,
      youtube: data.links.youtube,
      facebook: data.links?.facebook,
      connect: data.connect,
    };
  } catch (error) {
    console.error('Error fetching about data:', error);
    return null;
  }
}

export type UpdateAboutState = {
  errors?: Partial<Record<keyof AboutFormData, string[]>>;
  message?: string;
};

export async function updateAbout(
  prevState: UpdateAboutState,
  formData: FormData,
): Promise<UpdateAboutState> {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized' };
  }

  // Parse form data
  const rawData = {
    name: formData.get('name'),
    title: formData.get('title'),
    tagline: formData.get('tagline'),
    description: formData.getAll('description').filter(Boolean),
    bannerWebp: formData.get('bannerWebp'),
    profilePng: formData.get('profilePng'),
    profileWebp: formData.get('profileWebp'),
    website: formData.get('website'),
    email: formData.get('email'),
    github: formData.get('github'),
    linkedin: formData.get('linkedin'),
    xtwitter: formData.get('xtwitter'),
    instagram: formData.get('instagram'),
    youtube: formData.get('youtube'),
    facebook: formData.get('facebook'),
    connect: formData.getAll('connect').filter(Boolean),
  };

  const validatedFields = aboutSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errorTree = z.treeifyError(validatedFields.error);
    const fieldErrors: Partial<Record<keyof AboutFormData, string[]>> = {};

    for (const [key, value] of Object.entries(errorTree)) {
      if (value && typeof value === 'object' && '_errors' in value) {
        const errorNode = value as { _errors: string[] };
        fieldErrors[key as keyof AboutFormData] = errorNode._errors;
      }
    }

    return { errors: fieldErrors };
  }

  const { data } = validatedFields;

  // Transform to API format
  const apiData = {
    name: data.name,
    title: data.title,
    tagline: data.tagline,
    description: data.description,
    images: {
      bannerWebp: data.bannerWebp,
      profilePng: data.profilePng,
      profileWebp: data.profileWebp,
    },
    links: {
      website: data.website,
      email: data.email,
      github: data.github,
      linkedin: data.linkedin,
      xtwitter: data.xtwitter,
      instagram: data.instagram,
      youtube: data.youtube,
      facebook: data.facebook,
    },
    connect: data.connect,
  };

  const API_URL = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${API_URL}/about`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { message: 'Unauthorized' };
      }

      // Handle server-side validation errors (400)
      if (response.status === 400) {
        try {
          const errJson = await response.json();
          const errors: Partial<Record<keyof AboutFormData, string[]>> = {};

          if (errJson && Array.isArray(errJson.message)) {
            for (const item of errJson.message) {
              if (typeof item === 'string') {
                // Generic message, add to top-level message
                // We'll set the returned message below
                continue;
              }

              if (item && typeof item === 'object' && item.property && item.constraints) {
                // Map nested properties like 'links.website' or 'images.bannerWebp' to top-level keys
                const propPath = String(item.property);
                const segments = propPath.split('.');
                let key = segments[segments.length - 1];
                // If the last segment is a numeric array index (e.g., description.0), use the parent key
                if (/^\d+$/.test(key) && segments.length >= 2) {
                  key = segments[segments.length - 2];
                }
                const msgs = Object.values(item.constraints).map(String);
                // @ts-expect-error - dynamic key assignment from API validation result
                errors[key] = msgs;
              }
            }
          }

          return {
            errors: Object.keys(errors).length ? errors : undefined,
            message: errJson?.message
              ? Array.isArray(errJson.message)
                ? errJson.message.join(', ')
                : String(errJson.message)
              : 'Validation failed',
          };
        } catch {
          // fall through to generic message
        }
      }

      return { message: 'Failed to update about information' };
    }

    revalidatePath('/about');
    return { message: 'About information updated successfully' };
  } catch (error) {
    console.error('Error updating about:', error);
    return { message: 'Network error. Please try again.' };
  }
}
