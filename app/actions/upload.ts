'use server';

import { API_URL, ApiError, isStaticBailout, resource } from '@/lib/api';
import { IMAGE_FORMATS, IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from '@/lib/constants';
import { getSession } from '@/lib/session';
import type { UploadRecord } from '@/lib/types';

/**
 * Images.
 *
 * `/uploads` in v2.0.0 — v1's `/upload` is not aliased. The API is the only
 * thing in the platform holding Cloudinary credentials; nothing here does.
 *
 * The upload itself is a `multipart/form-data` POST and so does not go through
 * `lib/api.ts`, which serialises JSON.
 */

export interface UploadResult {
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
}

export interface UploadState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  data?: UploadResult;
}

const ALLOWED: readonly string[] = IMAGE_MIME_TYPES;

export async function uploadImage(
  prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const token = await getSession();
  if (!token) return { message: 'Your session has expired. Sign in again.' };

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return { errors: { file: ['Choose an image first.'] }, message: 'No file selected.' };
  }

  // Checked here as well as in the API. The API is the authority; this is so a
  // 10 MB file is refused before it is uploaded rather than after.
  if (!ALLOWED.includes(file.type)) {
    return {
      errors: {
        file: [`${file.type || 'That file'} is not an image. Send a ${IMAGE_FORMATS} file.`],
      },
      message: 'That file type is not accepted.',
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      errors: {
        file: [`That image is ${Math.round(file.size / 1024)} KB. The limit is 10 MB.`],
      },
      message: 'That image is too large.',
    };
  }

  const body = new FormData();
  body.append('file', file);
  const folder = String(formData.get('folder') ?? '').trim();
  if (folder) body.append('folder', folder);
  const publicId = String(formData.get('public_id') ?? '').trim();
  if (publicId) body.append('public_id', publicId);

  try {
    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
      cache: 'no-store',
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      return {
        message:
          payload?.error?.message ??
          `The upload failed with ${response.status} ${response.statusText}.`,
      };
    }

    return { success: true, message: 'Image uploaded.', data: await response.json() };
  } catch (error) {
    console.error('Upload failed:', error);
    return { message: 'The upload failed. The API did not answer — check that it is running.' };
  }
}

export async function getImages(): Promise<UploadRecord[]> {
  try {
    return (await resource<UploadRecord>('/uploads').list()).items;
  } catch (error) {
    // Rethrown, not swallowed: this is how Next learns the route is dynamic.
    if (isStaticBailout(error)) throw error;
    if (error instanceof ApiError) console.error('Could not list uploads:', error.message);
    return [];
  }
}

export async function deleteImage(publicId: string) {
  try {
    await resource<UploadRecord>('/uploads').remove(encodeURIComponent(publicId));
  } catch (error) {
    return {
      success: false,
      message: error instanceof ApiError ? error.message : 'Could not delete that image.',
    };
  }
  return { success: true, message: 'Image deleted.' };
}
