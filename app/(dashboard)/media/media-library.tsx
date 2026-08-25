'use client';

import { useActionState, useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { deleteImage, uploadImage } from '@/app/actions/upload';
import { useAlert } from '@/components/providers/alert-provider';
import { useToast } from '@/components/providers/toast-provider';
import { Button, Card, EmptyState, Field, FormMessage, Input } from '@/components/ui';
import type { UploadRecord } from '@/lib/types';

export function MediaLibrary({ images }: { images: UploadRecord[] }) {
  const toast = useToast();
  const alert = useAlert();
  const [copied, setCopied] = useState<string | null>(null);

  const [state, action, pending] = useActionState(uploadImage, {});

  async function onDelete(image: UploadRecord) {
    const confirmed = await alert.show({
      title: 'Delete this image?',
      message: `${image.fileName ?? image.publicId} will be removed from Cloudinary. Anything still pointing at it will break.`,
      confirmText: 'Delete image',
      cancelText: 'Keep it',
      variant: 'danger',
    });
    if (!confirmed) return;

    const result = await deleteImage(image.publicId);
    toast.push({
      title: result.message,
      type: result.success ? 'success' : 'error',
      duration: 5000,
    });
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    // Cleared rather than left set, so the next copy reads as a new one.
    window.setTimeout(() => setCopied(null), 2000);
  }

  return (
    <>
      <Card className="mb-8">
        <form action={action} className="grid gap-4">
          <FormMessage message={state.message} success={state.success} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="file" label="Image" required errors={state.errors?.file}>
              <Input
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                required
              />
            </Field>
            <Field
              name="folder"
              label="Folder"
              hint="Groups the upload in Cloudinary, e.g. events, projects."
            >
              <Input name="folder" type="text" placeholder="events" />
            </Field>
          </div>

          <div>
            <Button type="submit" disabled={pending}>
              {pending ? 'Uploading…' : 'Upload image'}
            </Button>
          </div>
        </form>
      </Card>

      {images.length === 0 ? (
        <EmptyState
          title="No images uploaded yet."
          hint="Upload one above, or from the image field on any record. Both go through the same endpoint."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <li key={image.publicId}>
              <Card className="p-4">
                {/* A plain `<img>`: next/image would want every Cloudinary
                    transform declared, and this is a file browser, not a page. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt=""
                  className="border-border-hairline bg-bg-raised h-32 w-full rounded border-[0.5px] object-contain"
                />
                <p className="text-fg text-small mt-3 truncate" title={image.publicId}>
                  {image.fileName ?? image.publicId}
                </p>
                <p className="text-fg-muted font-mono text-xs">
                  {image.width && image.height ? `${image.width}×${image.height}` : '—'}
                  {image.size ? ` · ${Math.round(image.size / 1024)} KB` : ''}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="compact"
                    onClick={() => void copy(image.url)}
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    {copied === image.url ? 'Copied' : 'Copy URL'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="compact"
                    onClick={() => void onDelete(image)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
