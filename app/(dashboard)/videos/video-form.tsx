"use client";

import { useActionState, useEffect } from "react";
import { 
  createVideo, 
  updateVideo, 
  VideoFormData, 
  VideoState 
} from "@/app/actions/videos";
import { Loader2, Save, X } from "lucide-react";

interface VideoFormProps {
  initialData?: VideoFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: VideoState = {
  message: "",
  errors: {},
};

export function VideoForm({ initialData, onSuccess, onCancel }: VideoFormProps) {
  // Bind the ID if updating
  const action = initialData 
    ? updateVideo.bind(null, initialData._id!) 
    : createVideo;

  const [state, formAction, isPending] = useActionState(action, initialState);
  
  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-6 bg-card p-6 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {initialData ? "Edit Video" : "Add New Video"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={initialData?.title}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.title && (
            <p className="text-red-500 text-sm">{state.errors.title[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">
            Publication Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={initialData?.date}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.date && (
            <p className="text-red-500 text-sm">{state.errors.date[0]}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="link" className="text-sm font-medium">
            Video Link
          </label>
          <input
            id="link"
            name="link"
            type="url"
            defaultValue={initialData?.link}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.link && (
            <p className="text-red-500 text-sm">{state.errors.link[0]}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="thumbnail" className="text-sm font-medium">
            Thumbnail URL
          </label>
          <input
            id="thumbnail"
            name="thumbnail"
            type="url"
            defaultValue={initialData?.thumbnail}
            placeholder="https://example.com/thumbnail.jpg"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.thumbnail && (
            <p className="text-red-500 text-sm">{state.errors.thumbnail[0]}</p>
          )}
        </div>
      </div>

      {state.message && (
        <p className={`text-sm ${state.success ? "text-green-500" : "text-red-500"}`}>
          {state.message}
        </p>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
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
