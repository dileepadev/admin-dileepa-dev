'use client';

import { useRef, useState } from 'react';
import { Check, Upload, X } from 'lucide-react';
import { uploadImage } from '@/app/actions/upload';
import { useToast } from '@/components/providers/toast-provider';
import { IMAGE_ACCEPT, IMAGE_FORMATS, MAX_IMAGE_BYTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from './Button';

type Status =
  | { kind: 'idle' }
  | { kind: 'done'; name: string }
  | { kind: 'failed'; reason: string };

/**
 * A Cloudinary URL, with an upload button beside it.
 *
 * The URL is the field — typing one in is as valid as uploading. The button is
 * a convenience, not the only path, which matters because the API is the only
 * thing holding Cloudinary credentials and it can be unavailable.
 *
 * The upload is fired directly rather than through `useActionState`, because
 * this control lives inside another form and a nested form is not allowed.
 *
 * **An upload has to say three things.** That it started, that it finished, and
 * what it did if it did not. It used to say all three in the same grey line of
 * eight-pixel text under the field, which on a form with six image fields is
 * indistinguishable from the hint above it. Now: the button holds the spinner
 * and an indeterminate bar runs under the field while it is in flight, and the
 * outcome is a toast — the same toast a save produces, because from where a
 * person is standing it is the same kind of event.
 *
 * The bar is indeterminate on purpose. The upload goes through a server action,
 * so there are no byte-level progress events to read, and a percentage that is
 * really a guess is worse than an honest "working".
 */
export function ImageField({
  name,
  label,
  defaultValue,
  folder,
  required,
  errors,
  hint,
  className,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  folder?: string;
  required?: boolean;
  errors?: string[];
  hint?: string;
  className?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? '');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function onFile(file: File) {
    // Refused before it is sent rather than after a ten-megabyte round trip.
    // The API checks this too and is the authority; this is about the wait.
    if (file.size > MAX_IMAGE_BYTES) {
      const reason = `${file.name} is ${Math.round(file.size / 1024)} KB. The limit is 10 MB.`;
      setStatus({ kind: 'failed', reason });
      toast.push({
        title: 'That image is too large.',
        description: reason,
        type: 'error',
        duration: 6000,
      });
      return;
    }

    setBusy(true);
    setStatus({ kind: 'idle' });

    const data = new FormData();
    data.append('file', file);
    if (folder) data.append('folder', folder);

    const result = await uploadImage({}, data);
    setBusy(false);

    if (result.success && result.data) {
      setUrl(result.data.url);
      setStatus({ kind: 'done', name: file.name });
      toast.push({
        title: `${label} uploaded.`,
        // The format is worth showing: it is how you notice Cloudinary
        // re-encoded a JPEG you meant to keep, or that the wrong file went up.
        description: [file.name, result.data.format?.toUpperCase(), sizeOf(result.data.bytes)]
          .filter(Boolean)
          .join(' · '),
        type: 'success',
        duration: 4000,
      });
    } else {
      // The API writes its messages to be read — a wrong file type, a file too
      // large, Cloudinary refusing — so they are passed through unchanged.
      const reason = result.errors?.file?.join(' ') ?? result.message ?? 'The upload failed.';
      setStatus({ kind: 'failed', reason });
      toast.push({
        title: `${label} did not upload.`,
        description: reason,
        type: 'error',
        duration: 8000,
      });
    }
  }

  return (
    <div className={cn('field', className)}>
      <span className="flex items-center gap-1 font-medium">
        <span>{label}</span>
        {required && (
          <span className="req text-brand" aria-hidden="true">
            *
          </span>
        )}
      </span>

      <div className="flex gap-2">
        <input
          id={name}
          name={name}
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://res.cloudinary.com/…"
          aria-invalid={errors?.length ? true : undefined}
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          busy={busy}
          onClick={() => fileRef.current?.click()}
          className="flex-none"
        >
          {!busy && <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
          {busy ? 'Uploading…' : 'Upload'}
        </Button>
      </div>

      {busy && (
        <span
          className="progress progress--indeterminate"
          role="progressbar"
          aria-label={`Uploading ${label.toLowerCase()}`}
        >
          <span />
        </span>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFile(file);
          // Cleared so choosing the same file twice fires a second change.
          event.target.value = '';
        }}
      />

      {url && (
        // A plain `<img>`: this is a preview of an arbitrary URL a person just
        // typed, and next/image would refuse anything not in remotePatterns.
        // Every accepted format renders here without conversion — the browser
        // decodes JPG, PNG, WebP, GIF and SVG alike.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="border-border-strong bg-bg-raised mt-1 h-16 w-16 rounded border object-contain"
        />
      )}

      {hint && <span className="hint">{hint}</span>}
      {!hint && <span className="hint">{IMAGE_FORMATS}, up to 10 MB.</span>}

      {status.kind === 'done' && (
        <span className="text-fg-muted text-label inline-flex items-center gap-1.5">
          <Check className="text-brand h-3.5 w-3.5" aria-hidden="true" />
          {status.name} uploaded.
        </span>
      )}
      {status.kind === 'failed' && (
        <span className="field-error inline-flex items-start gap-1.5">
          <X className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden="true" />
          {status.reason}
        </span>
      )}

      {errors?.length ? <span className="field-error">{errors.join(' ')}</span> : null}
    </div>
  );
}

function sizeOf(bytes: number | null | undefined): string {
  if (!bytes) return '';
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}
