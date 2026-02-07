'use client';

import { useActionState, useState } from 'react';
import { createTool, updateTool, ToolFormData, ActionState } from '@/app/actions/tools';
import { Loader2, Save, X } from 'lucide-react';
import Image from 'next/image';

interface ToolFormProps {
  initialData?: ToolFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ToolForm({ initialData, onSuccess, onCancel }: ToolFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = initialData?._id
        ? await updateTool(initialData._id, formData)
        : await createTool(formData);

      if (result.success) {
        onSuccess();
      }

      return result;
    },
    { success: false, message: '', errors: {} },
  );

  const [lightPreview, setLightPreview] = useState(initialData?.logo?.light || '');
  const [darkPreview, setDarkPreview] = useState(initialData?.logo?.dark || '');

  return (
    <div className="bg-card border-border rounded-lg border p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{initialData ? 'Edit Tool' : 'Add New Tool'}</h2>
        <button
          onClick={onCancel}
          className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Tool Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={initialData?.name}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g. Next.js"
          />
          {state.errors?.name && (
            <p className="text-destructive mt-1 text-sm">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="logo.light" className="text-sm font-medium">
              Light Mode Logo URL
            </label>
            <input
              id="logo.light"
              name="logo.light"
              type="url"
              defaultValue={initialData?.logo?.light}
              onChange={(e) => setLightPreview(e.target.value)}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="https://..."
            />
            {lightPreview && (
              <div className="relative mt-2 h-16 w-16 overflow-hidden rounded-md border">
                <Image
                  src={lightPreview}
                  alt="Light logo preview"
                  fill
                  unoptimized
                  className="object-contain p-2"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
            {state.errors?.['logo.light'] && (
              <p className="text-destructive mt-1 text-sm">{state.errors['logo.light'][0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="logo.dark" className="text-sm font-medium">
              Dark Mode Logo URL
            </label>
            <input
              id="logo.dark"
              name="logo.dark"
              type="url"
              defaultValue={initialData?.logo?.dark}
              onChange={(e) => setDarkPreview(e.target.value)}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="https://..."
            />
            {darkPreview && (
              <div className="relative mt-2 h-16 w-16 overflow-hidden rounded-md border">
                <Image
                  src={darkPreview}
                  alt="Dark logo preview"
                  fill
                  unoptimized
                  className="object-contain p-2"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
            {state.errors?.['logo.dark'] && (
              <p className="text-destructive mt-1 text-sm">{state.errors['logo.dark'][0]}</p>
            )}
          </div>
        </div>

        {state.message && (
          <div
            className={`rounded-md p-3 text-sm ${
              state.success
                ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                : 'bg-destructive/15 text-destructive'
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
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
                Save Tool
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
