'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  link: z.string().url('Link must be a valid URL'),
});

export type BlogFormData = z.infer<typeof blogSchema> & { _id?: string };

export async function getBlogs(): Promise<BlogFormData[]> {
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchWithRetry(attempt = 0): Promise<Response> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const res = await fetch(`${API_BASE_URL}/blogs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    // If rate-limited, attempt exponential backoff (honor Retry-After if present)
    if (res.status === 429 && attempt < 3) {
      const retryAfter = res.headers.get('Retry-After');
      const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.pow(2, attempt) * 1000;
      console.warn(`Rate limited fetching blogs. Retry #${attempt + 1} after ${delay}ms`);
      await sleep(delay);
      return fetchWithRetry(attempt + 1);
    }

    return res;
  }

  try {
    const response = await fetchWithRetry();

    if (!response.ok) {
      // Provide more informative error messages for common cases
      if (response.status === 404) {
        // No blogs yet
        return [];
      }
      if (response.status === 401) {
        throw new Error('Unauthorized when fetching blogs');
      }
      if (response.status === 429) {
        throw new Error('Rate limited when fetching blogs (429)');
      }
      throw new Error(`Failed to fetch blogs: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error(`Failed to fetch blogs: ${(error as Error).message}`);
  }
}

export async function createBlog(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const rawData = {
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      excerpt: formData.get('excerpt') as string,
      link: formData.get('link') as string,
    };

    const validation = blogSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `Failed to create blog: ${response.statusText}`,
      };
    }

    revalidatePath('/dashboard/blogs');
    return { success: true, message: 'Blog created successfully' };
  } catch (error) {
    console.error('Error creating blog:', error);
    return { success: false, message: 'Failed to create blog' };
  }
}

export async function updateBlog(id: string, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const rawData = {
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      excerpt: formData.get('excerpt') as string,
      link: formData.get('link') as string,
    };

    const validation = blogSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `Failed to update blog: ${response.statusText}`,
      };
    }

    revalidatePath('/dashboard/blogs');
    return { success: true, message: 'Blog updated successfully' };
  } catch (error) {
    console.error('Error updating blog:', error);
    return { success: false, message: 'Failed to update blog' };
  }
}

export async function deleteBlog(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `Failed to delete blog: ${response.statusText}`,
      };
    }

    revalidatePath('/dashboard/blogs');
    return { success: true, message: 'Blog deleted successfully' };
  } catch (error) {
    console.error('Error deleting blog:', error);
    return { success: false, message: 'Failed to delete blog' };
  }
}
