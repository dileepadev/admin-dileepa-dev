'use client';

import { useActionState, useRef, useState, useEffect } from 'react';
import {
  uploadImage,
  deleteImage,
  getImages,
  UploadState,
  UploadResult,
} from '@/app/actions/upload';
import { Loader2, Upload, Image as ImageIcon, Trash2, Copy, Check, X } from 'lucide-react';

const initialState: UploadState = {
  message: '',
  errors: {},
};

export function UploadPage() {
  const [state, formAction, isPending] = useActionState(uploadImage, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const images = await getImages();
        setUploadHistory(images);
      } catch (error) {
        console.error('Failed to fetch images:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    fetchImages();
  }, []);

  useEffect(() => {
    if (state.success && state.data) {
      setUploadHistory((prev) => [state.data!, ...prev]);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [state]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleClearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    setDeletingId(publicId);
    try {
      const result = await deleteImage(publicId);
      if (result.success) {
        setUploadHistory((prev) => prev.filter((item) => item.publicId !== publicId));
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to delete image', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <div className="bg-card border-border rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Upload Image</h2>
        <form action={formAction} className="space-y-4">
          {/* File Input with Drop Zone */}
          <div className="space-y-2">
            <label htmlFor="file" className="text-sm font-medium">
              Image File <span className="ml-1 text-red-500">*</span>
            </label>
            <div
              className="border-input bg-background hover:border-ring relative flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <div className="relative w-full max-w-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto max-h-64 rounded-md object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearPreview();
                    }}
                    className="bg-background/80 hover:bg-background absolute top-2 right-2 rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="text-muted-foreground mb-2 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">Click to select an image</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    JPEG, PNG, WebP, GIF, SVG — Max 10 MB
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                id="file"
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={handleFileChange}
                className="sr-only"
                required
                aria-required="true"
              />
            </div>
            {state.errors?.file && <p className="text-sm text-red-500">{state.errors.file[0]}</p>}
          </div>

          {/* Folder Input */}
          <div className="space-y-2">
            <label htmlFor="folder" className="text-sm font-medium">
              Folder <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="folder"
              name="folder"
              type="text"
              placeholder="dileepa-dev"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-muted-foreground text-xs">
              Cloudinary folder to organize uploads. Defaults to &quot;dileepa-dev&quot;.
            </p>
          </div>

          {/* Status Message */}
          {state.message && (
            <p className={`text-sm ${state.success ? 'text-green-500' : 'text-red-500'}`}>
              {state.message}
            </p>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Media Library */}
      <div className="bg-card border-border rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Media Library</h2>

        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <span className="text-muted-foreground ml-3">Loading images...</span>
          </div>
        ) : uploadHistory.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploadHistory.map((item) => (
              <div
                key={item.publicId}
                className="border-border bg-background overflow-hidden rounded-lg border"
              >
                <div className="bg-muted relative aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.publicId} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-2 p-3">
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>
                      {item.width}×{item.height} • {item.format.toUpperCase()}
                    </span>
                    <span>{formatBytes(item.bytes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      readOnly
                      value={item.url}
                      className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-8 w-full truncate rounded-md border px-2 text-xs focus-visible:ring-1 focus-visible:outline-none"
                    />
                    <button
                      onClick={() => handleCopyUrl(item.url)}
                      className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      title="Copy URL"
                    >
                      {copiedUrl === item.url ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item.publicId)}
                      disabled={deletingId === item.publicId}
                      className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-destructive hover:text-destructive-foreground text-destructive inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      title="Delete"
                    >
                      {deletingId === item.publicId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="text-muted-foreground mb-3 h-12 w-12 opacity-20" />
            <p className="text-muted-foreground text-sm">No images found in your media library.</p>
          </div>
        )}
      </div>
    </div>
  );
}
