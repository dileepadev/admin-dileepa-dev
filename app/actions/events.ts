'use server';

import { z } from 'zod';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

const eventSchema = z.object({
  _id: z.string().optional(),
  index: z.coerce.number().min(0, 'Index must be 0 or greater'),
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  format: z.string().min(1, 'Format is required'),
  description: z.string().min(1, 'Description is required'),
});

export type EventFormData = z.infer<typeof eventSchema>;

export type EventState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

const API_URL = process.env.API_URL || 'http://localhost:3000';

export async function getEvents(): Promise<EventFormData[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const response = await fetch(`${API_URL}/events`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No events
        return [];
      }
      console.error('Failed to fetch events:', response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function createEvent(prevState: EventState, formData: FormData): Promise<EventState> {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized' };
  }

  const rawData = {
    index: formData.get('index'),
    title: formData.get('title'),
    date: formData.get('date'),
    location: formData.get('location'),
    format: formData.get('format'),
    description: formData.get('description'),
  };

  const validatedFields = eventSchema.omit({ _id: true }).safeParse(rawData);

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
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      return { message: `Failed to create event: ${response.statusText}` };
    }

    revalidatePath('/events');
    return { message: 'Event created successfully', success: true };
  } catch (error) {
    console.error('Error creating event:', error);
    return { message: 'Failed to create event' };
  }
}

export async function updateEvent(
  id: string,
  prevState: EventState,
  formData: FormData,
): Promise<EventState> {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized' };
  }

  const rawData = {
    index: formData.get('index'),
    title: formData.get('title'),
    date: formData.get('date'),
    location: formData.get('location'),
    format: formData.get('format'),
    description: formData.get('description'),
  };

  const validatedFields = eventSchema.omit({ _id: true }).safeParse(rawData);

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
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      return { message: `Failed to update event: ${response.statusText}` };
    }

    revalidatePath('/events');
    return { message: 'Event updated successfully', success: true };
  } catch {
    return { message: 'Failed to update event' };
  }
}

export async function deleteEvent(id: string) {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized' };
  }

  try {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }

    revalidatePath('/events');
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, message: 'Failed to delete event' };
  }
}
