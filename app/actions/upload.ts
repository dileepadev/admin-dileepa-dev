'use server';

import { getSession } from '@/lib/session';

const API_URL = process.env.API_URL || 'http://localhost:3000';

export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export type UploadState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  data?: UploadResult;
};

export async function uploadImage(
  prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized' };
  }

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return {
      errors: { file: ['Please select an image file'] },
      message: 'No file selected',
    };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return {
      errors: {
        file: [`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, SVG`],
      },
      message: 'Invalid file type',
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSize) {
    return {
      errors: { file: ['File too large. Maximum size is 10 MB'] },
      message: 'File too large',
    };
  }

  const folder = (formData.get('folder') as string) || '';

  try {
    const apiFormData = new FormData();
    apiFormData.append('file', file);
    if (folder) {
      apiFormData.append('folder', folder);
    }

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session}`,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Upload API Error:', errorData);
      return {
        message: `Upload failed: ${errorData.message || response.statusText}`,
      };
    }

    const data: UploadResult = await response.json();
    return {
      message: 'Image uploaded successfully',
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { message: 'Failed to upload image' };
  }
}

/**
 * Fetches all uploaded images from the API (database)
 */
export async function getImages(): Promise<UploadResult[]> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session}`,
      },
      next: { revalidate: 0 }, // Disable caching for fresh data
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No images uploaded yet
        return [];
      }
      throw new Error('Failed to fetch images');
    }

    const data = await response.json();
    // Map database model to UploadResult
    return data.map(
      (item: {
        url: string;
        publicId: string;
        width: number;
        height: number;
        format: string;
        size: number;
      }) => ({
        url: item.url,
        publicId: item.publicId,
        width: item.width,
        height: item.height,
        format: item.format,
        bytes: item.size,
      }),
    );
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

export async function deleteImage(publicId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const response = await fetch(`${API_URL}/upload/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!response.ok) {
      return { success: false, message: 'Failed to delete image' };
    }

    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, message: 'Failed to delete image' };
  }
}
