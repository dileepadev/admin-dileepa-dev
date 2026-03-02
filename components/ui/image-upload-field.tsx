'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { uploadImage } from '@/app/actions/upload';

interface ImageUploadFieldProps {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  folder?: string;
  onChange?: (value: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  error?: string;
}

export function ImageUploadField({
  label,
  name,
  defaultValue = '',
  required = false,
  folder = 'dileepa-dev',
  onChange,
  onUploadingChange,
  error,
}: ImageUploadFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onChange) onChange(newValue);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    if (onUploadingChange) onUploadingChange(true);

    // Client-side validation for type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (!allowedTypes.includes(file.type)) {
      setUploadError(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, SVG`);
      setIsUploading(false);
      if (onUploadingChange) onUploadingChange(false);
      // Reset file input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 10 MB');
      setIsUploading(false);
      if (onUploadingChange) onUploadingChange(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const result = await uploadImage({ message: '' }, formData);

      if (result.success && result.data) {
        const url = result.data.url;
        setValue(url);
        if (onChange) onChange(url);
      } else {
        setUploadError(result.message || 'Upload failed');
      }
    } catch (err) {
      setUploadError('An unexpected error occurred during upload');
      console.error(err);
    } finally {
      setIsUploading(false);
      if (onUploadingChange) onUploadingChange(false);
      // Reset file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearValue = () => {
    setValue('');
    if (onChange) onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={clearValue}
            className="text-muted-foreground hover:text-destructive text-xs"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id={name}
            name={name}
            value={value}
            onChange={handleTextChange}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="https://..."
            required={required}
            aria-required={required}
          />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          title="Upload Image"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </button>
      </div>

      {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {value && (
        <div className="border-border bg-muted relative mt-2 h-20 w-20 overflow-hidden rounded-md border">
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-contain p-1"
            unoptimized={true}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}
    </div>
  );
}
