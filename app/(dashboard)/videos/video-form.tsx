'use client';

import { useActionState, useEffect } from 'react';
import { createVideo, updateVideo, VideoFormData, VideoState } from '@/app/actions/videos';
import { Loader2, Save, X } from 'lucide-react';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useToast } from '@/components/providers/toast-provider';

interface VideoFormProps {
  initialData?: VideoFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: VideoState = {
  message: '',
  errors: {},
};

export function VideoForm({ initialData, onSuccess, onCancel }: VideoFormProps) {
  // Bind the ID if updating
  const action = initialData ? updateVideo.bind(null, initialData._id!) : createVideo;

  const [state, formAction, isPending] = useActionState(action, initialState);
  const { push: pushToast } = useToast();

  useEffect(() => {
    if (state.success) {
      pushToast({
        title: initialData ? 'Video Updated' : 'Video Created',
        description:
          state.message || `Video has been successfully ${initialData ? 'updated' : 'created'}.`,
        type: 'success',
      });
      onSuccess();
    } else if (state.message && !state.success) {
      pushToast({
        title: 'Operation Failed',
        description: state.message,
        type: 'error',
      });
    }
  }, [state.success, state.message, onSuccess, pushToast, initialData]);

  return (
    <form action={formAction} className="bg-card border-border space-y-6 rounded-lg border p-6">
      <p className="text-muted-foreground text-sm">
        All fields are required. Fields marked with <span className="text-red-500">*</span> are
        required.
      </p>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{initialData ? 'Edit Video' : 'Add New Video'}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            defaultValue={initialData?.title}
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.title && <p className="text-sm text-red-500">{state.errors.title[0]}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">
            Publication Date <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={
              initialData?.date ? new Date(initialData.date).toISOString().slice(0, 10) : undefined
            }
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.date && <p className="text-sm text-red-500">{state.errors.date[0]}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="link" className="text-sm font-medium">
            Video Link <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="link"
            name="link"
            type="url"
            defaultValue={initialData?.link}
            aria-required="true"
            placeholder="https://www.youtube.com/watch?v=..."
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.link && <p className="text-sm text-red-500">{state.errors.link[0]}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <ImageUploadField
            name="thumbnail"
            label="Thumbnail URL"
            defaultValue={initialData?.thumbnail}
            folder="videos"
            required
          />
          {state.errors?.thumbnail && (
            <p className="text-sm text-red-500">{state.errors.thumbnail[0]}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Video
            </>
          )}
        </button>
      </div>
    </form>
  );
}
