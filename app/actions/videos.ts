'use server';

import { z } from 'zod';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const urlField = (message: string) => z.string().refine(isValidUrl, { message });

const videoSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  link: urlField('Invalid video link URL'),
  thumbnail: urlField('Invalid thumbnail URL'),
});

export type VideoFormData = z.infer<typeof videoSchema>;

export type VideoState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

const API_URL = process.env.API_URL || 'http://localhost:3000';

export async function getVideos(): Promise<VideoFormData[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const response = await fetch(`${API_URL}/videos`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No videos found — return empty list quietly
        return [];
      }
      console.error('Failed to fetch videos:', response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

export async function createVideo(prevState: VideoState, formData: FormData): Promise<VideoState> {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized' };
  }

  const rawData = {
    title: formData.get('title'),
    date: formData.get('date'),
    link: formData.get('link'),
    thumbnail: formData.get('thumbnail'),
  };

  const validatedFields = videoSchema.omit({ _id: true }).safeParse(rawData);

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
    const response = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response (create video):', errorData);
      const apiMessage =
        (errorData && (errorData.message || errorData.error || JSON.stringify(errorData))) ||
        response.statusText;
      return { message: `Failed to create video: ${apiMessage}` };
    }

    revalidatePath('/videos');
    return { message: 'Video created successfully', success: true };
  } catch (error) {
    console.error('Error creating video:', error);
    return { message: 'Failed to create video' };
  }
}

export async function updateVideo(
  id: string,
  prevState: VideoState,
  formData: FormData,
): Promise<VideoState> {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized' };
  }

  const rawData = {
    title: formData.get('title'),
    date: formData.get('date'),
    link: formData.get('link'),
    thumbnail: formData.get('thumbnail'),
  };

  const validatedFields = videoSchema.omit({ _id: true }).safeParse(rawData);

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
    const response = await fetch(`${API_URL}/videos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response (update video):', errorData);
      const apiMessage =
        (errorData && (errorData.message || errorData.error || JSON.stringify(errorData))) ||
        response.statusText;
      return { message: `Failed to update video: ${apiMessage}` };
    }

    revalidatePath('/videos');
    return { message: 'Video updated successfully', success: true };
  } catch {
    return { message: 'Failed to update video' };
  }
}

export async function deleteVideo(id: string) {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized' };
  }

  try {
    const response = await fetch(`${API_URL}/videos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete video');
    }

    revalidatePath('/videos');
    return { success: true };
  } catch (error) {
    console.error('Error deleting video:', error);
    return { success: false, message: 'Failed to delete video' };
  }
}
