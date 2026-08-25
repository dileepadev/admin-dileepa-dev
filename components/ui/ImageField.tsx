'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadImage } from '@/app/actions/upload';
import { Button } from './Button';

/**
 * A Cloudinary URL, with an upload button beside it.
 *
 * The URL is the field — typing one in is as valid as uploading. The button is
 * a convenience, not the only path, which matters because the API is the only
 * thing holding Cloudinary credentials and it can be unavailable.
 *
 * The upload is fired directly rather than through `useActionState`, because
 * this control lives inside another form and a nested form is not allowed.
 */
export function ImageField({
  name,
  label,
  defaultValue,
  folder,
  errors,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  folder?: string;
  errors?: string[];
  hint?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? '');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File) {
    setBusy(true);
    setStatus(null);

    const data = new FormData();
    data.append('file', file);
    if (folder) data.append('folder', folder);

    const result = await uploadImage({}, data);
    setBusy(false);

    if (result.success && result.data) {
      setUrl(result.data.url);
      setStatus('Uploaded.');
    } else {
      setStatus(result.message ?? 'The upload failed.');
    }
  }

  return (
    <div className="field">
      <span>{label}</span>

      <div className="flex gap-2">
        <input
          id={name}
          name={name}
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://res.cloudinary.com/…"
          aria-invalid={errors?.length ? true : undefined}
        />
        <Button
          type="button"
          variant="secondary"
          size="compact"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          {busy ? 'Uploading…' : 'Upload'}
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFile(file);
          event.target.value = '';
        }}
      />

      {url && (
        // A plain `<img>`: this is a preview of an arbitrary URL a person just
        // typed, and next/image would refuse anything not in remotePatterns.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="border-border-hairline bg-bg-raised mt-1 h-16 w-16 rounded border-[0.5px] object-contain"
        />
      )}

      {hint && <span className="text-fg-muted text-xs">{hint}</span>}
      {status && <span className="text-fg-muted text-xs">{status}</span>}
      {errors?.length ? <span className="field-error">{errors.join(' ')}</span> : null}
    </div>
  );
}
