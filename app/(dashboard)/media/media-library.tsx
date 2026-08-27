'use client';

import { useActionState, useRef, useState } from 'react';
import { Check, Copy, Paperclip, Trash2 } from 'lucide-react';
import { deleteImage, uploadImage, type UploadState } from '@/app/actions/upload';
import { useAlert } from '@/components/providers/alert-provider';
import { useToast } from '@/components/providers/toast-provider';
import { Button, Card, EmptyState, Field, FormMessage, Input } from '@/components/ui';
import { IMAGE_ACCEPT, IMAGE_FORMATS } from '@/lib/constants';
import type { UploadRecord } from '@/lib/types';

export function MediaLibrary({ images }: { images: UploadRecord[] }) {
  const toast = useToast();
  const alert = useAlert();
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');

  // Wrapped rather than passed straight to `useActionState`, so the outcome
  // reaches a toast as well as the form. The message under the form is there
  // when you are looking at the form; the toast is there when you are not,
  // which after picking a file is where most people are.
  const [state, action, pending] = useActionState(
    async (previous: UploadState, formData: FormData) => {
      const result = await uploadImage(previous, formData);
      toast.push({
        title: result.success ? 'Image uploaded.' : 'The upload failed.',
        description: result.success
          ? result.data?.publicId
          : (result.errors?.file?.join(' ') ?? result.message),
        type: result.success ? 'success' : 'error',
        duration: result.success ? 4000 : 8000,
      });
      if (result.success) setFileName('');
      return result;
    },
    {},
  );

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

          <div className="form-grid">
            <Field
              name="file"
              label="Image"
              required
              errors={state.errors?.file}
              hint={`${IMAGE_FORMATS}, up to 10 MB.`}
            >
              {/* Hidden native file picker — triggered by the button below so
                  the browser's "Choose File No file chosen" text never shows. */}
              <input
                ref={fileRef}
                id="file"
                name="file"
                type="file"
                accept={IMAGE_ACCEPT}
                required
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              />
              {/* Styled trigger row: a read-only text display + pick button */}
              <div className="flex gap-2">
                <div
                  className="border-border-input text-fg-muted text-body flex min-w-0 flex-1 cursor-pointer items-center truncate rounded border px-3"
                  style={{ height: 'var(--control-h)' }}
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <span className="truncate">{fileName || 'No file chosen'}</span>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-none"
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                  Choose file
                </Button>
              </div>
            </Field>
            <Field
              name="folder"
              label="Folder"
              hint="Groups the upload in Cloudinary, e.g. events, projects."
            >
              <Input name="folder" type="text" placeholder="events" />
            </Field>
          </div>

          {pending && (
            <span
              className="progress progress--indeterminate"
              role="progressbar"
              aria-label="Uploading image"
            >
              <span />
            </span>
          )}

          <div>
            <Button type="submit" busy={pending}>
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
              <Card className="flex h-full flex-col justify-between p-4">
                <div>
                  <div className="border-border-strong bg-bg-raised flex h-36 w-full items-center justify-center overflow-hidden rounded border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <p
                    className="text-fg text-small mt-3 truncate font-medium"
                    title={image.fileName ?? image.publicId}
                  >
                    {image.fileName ?? image.publicId}
                  </p>
                  <p className="text-fg-muted text-label mt-1 font-mono">
                    {image.width && image.height ? `${image.width}×${image.height}` : '—'}
                    {image.size ? ` · ${Math.round(image.size / 1024)} KB` : ''}
                  </p>
                </div>

                <div className="border-border-hairline mt-4 flex items-center gap-2 border-t pt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="compact"
                    onClick={() => void copy(image.url)}
                    className="flex-1"
                  >
                    {copied === image.url ? (
                      <Check className="text-brand h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {copied === image.url ? 'Copied' : 'Copy URL'}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
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
