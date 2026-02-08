'use client';

import { useActionState } from 'react';
import { createBlog, updateBlog, BlogFormData } from '@/app/actions/blogs';
import { Loader2, Save, X } from 'lucide-react';

interface BlogFormProps {
  initialData?: BlogFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BlogForm({ initialData, onSuccess, onCancel }: BlogFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: { success: boolean; message: string; errors?: Record<string, string[]> },
      formData: FormData,
    ) => {
      const result = initialData?._id
        ? await updateBlog(initialData._id, formData)
        : await createBlog(formData);

      if (result.success) {
        onSuccess();
      }

      return result;
    },
    { success: false, message: '', errors: {} },
  );

  return (
    <div className="bg-card border-border rounded-lg border p-6">
      <p className="text-muted-foreground text-sm">
        All fields are required. Fields marked with <span className="text-red-500">*</span> are
        required.
      </p>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{initialData ? 'Edit Blog' : 'Add New Blog'}</h2>
        <button
          onClick={onCancel}
          className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form action={formAction} className="space-y-6">
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
              placeholder="Enter blog title"
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
                initialData?.date
                  ? new Date(initialData.date).toISOString().slice(0, 10)
                  : undefined
              }
              aria-required="true"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
            {state.errors?.date && <p className="text-sm text-red-500">{state.errors.date[0]}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="excerpt" className="text-sm font-medium">
            Excerpt <span className="ml-1 text-red-500">*</span>
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            defaultValue={initialData?.excerpt}
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter a short excerpt of the blog post"
            required
          />
          {state.errors?.excerpt && (
            <p className="text-sm text-red-500">{state.errors.excerpt[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="link" className="text-sm font-medium">
            Blog Link <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="link"
            name="link"
            type="url"
            defaultValue={initialData?.link}
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="https://blog.dileepa.dev/your-blog-post"
            required
          />
          {state.errors?.link && <p className="text-sm text-red-500">{state.errors.link[0]}</p>}
        </div>

        {state.message && !state.success && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{state.message}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            disabled={isPending}
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
                Save Blog
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
