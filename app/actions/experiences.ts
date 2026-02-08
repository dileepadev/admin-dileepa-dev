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

const logoSchema = z.object({
  light: urlField('Invalid light logo URL'),
  dark: urlField('Invalid dark logo URL'),
});

const experienceSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  url: urlField('Invalid Company URL'),
  period: z.string().min(1, 'Period is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z
    .array(z.string().min(1, 'Technology cannot be empty'))
    .min(1, 'At least one technology is required'),
  logo: logoSchema,
});

export type ExperienceFormData = z.infer<typeof experienceSchema>;

export type ExperienceState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

const API_URL = process.env.API_URL || 'http://localhost:3000';

export async function getExperiences(): Promise<ExperienceFormData[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const response = await fetch(`${API_URL}/experiences`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No experiences found — return empty list without noisy error
        return [];
      }
      console.error('Failed to fetch experiences:', response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return [];
  }
}

export async function createExperience(
  prevState: ExperienceState,
  formData: FormData,
): Promise<ExperienceState> {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized' };
  }

  const rawData = {
    title: formData.get('title'),
    company: formData.get('company'),
    url: formData.get('url'),
    period: formData.get('period'),
    description: formData.get('description'),
    technologies: formData.getAll('technologies').filter(Boolean),
    logo: {
      light: formData.get('logo.light'),
      dark: formData.get('logo.dark'),
    },
  };

  const validatedFields = experienceSchema.omit({ _id: true }).safeParse(rawData);

  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};
    validatedFields.error.issues.forEach((issue: z.ZodIssue) => {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    });
    return { errors: fieldErrors, message: 'Validation failed' };
  }

  try {
    const payload = JSON.stringify(validatedFields.data);
    console.log('Sending payload to API:', payload);
    const response = await fetch(`${API_URL}/experiences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session}`,
      },
      body: payload,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      const apiMessage =
        (errorData && (errorData.message || errorData.error || JSON.stringify(errorData))) ||
        response.statusText;
      return { message: `Failed to create experience: ${apiMessage}` };
    }

    revalidatePath('/experiences');
    return { message: 'Experience created successfully', success: true };
  } catch (error) {
    console.error('Error creating experience:', error);
    return { message: 'Failed to create experience' };
  }
}

export async function updateExperience(
  id: string,
  prevState: ExperienceState,
  formData: FormData,
): Promise<ExperienceState> {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized' };
  }

  const rawData = {
    title: formData.get('title'),
    company: formData.get('company'),
    url: formData.get('url'),
    period: formData.get('period'),
    description: formData.get('description'),
    technologies: formData.getAll('technologies').filter(Boolean),
    logo: {
      light: formData.get('logo.light'),
      dark: formData.get('logo.dark'),
    },
  };

  const validatedFields = experienceSchema.omit({ _id: true }).safeParse(rawData);

  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};
    validatedFields.error.issues.forEach((issue: z.ZodIssue) => {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    });
    return { errors: fieldErrors, message: 'Validation failed' };
  }

  try {
    const payload = JSON.stringify(validatedFields.data);
    console.log('Updating payload to API:', payload);
    const response = await fetch(`${API_URL}/experiences/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session}`,
      },
      body: payload,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response (update):', errorData);
      const apiMessage =
        (errorData && (errorData.message || errorData.error || JSON.stringify(errorData))) ||
        response.statusText;
      return { message: `Failed to update experience: ${apiMessage}` };
    }

    revalidatePath('/experiences');
    return { message: 'Experience updated successfully', success: true };
  } catch {
    return { message: 'Failed to update experience' };
  }
}

export async function deleteExperience(id: string) {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized' };
  }

  try {
    const response = await fetch(`${API_URL}/experiences/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete experience');
    }

    revalidatePath('/experiences');
    return { success: true };
  } catch (error) {
    console.error('Error deleting experience:', error);
    return { success: false, message: 'Failed to delete experience' };
  }
}
