'use client';

import { useActionState } from 'react';
import { createTool, updateTool, ToolFormData, ActionState } from '@/app/actions/tools';
import { Loader2, Save, X } from 'lucide-react';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useToast } from '@/components/providers/toast-provider';

interface ToolFormProps {
  initialData?: ToolFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ToolForm({ initialData, onSuccess, onCancel }: ToolFormProps) {
  const { push: pushToast } = useToast();

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = initialData?._id
        ? await updateTool(initialData._id, formData)
        : await createTool(formData);

      if (result.success) {
        pushToast({
          title: initialData ? 'Tool Updated' : 'Tool Created',
          description:
            result.message || `Tool has been successfully ${initialData ? 'updated' : 'created'}.`,
          type: 'success',
        });
        onSuccess();
      } else if (result.message) {
        pushToast({
          title: 'Operation Failed',
          description: result.message,
          type: 'error',
        });
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
            Tool Name <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            aria-required="true"
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
            <ImageUploadField
              name="logo.light"
              label="Light Mode Logo"
              defaultValue={initialData?.logo?.light}
              folder="tools"
              required
            />
            {state.errors?.['logo.light'] && (
              <p className="text-destructive mt-1 text-sm">{state.errors['logo.light'][0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <ImageUploadField
              name="logo.dark"
              label="Dark Mode Logo"
              defaultValue={initialData?.logo?.dark}
              folder="tools"
              required
            />
            {state.errors?.['logo.dark'] && (
              <p className="text-destructive mt-1 text-sm">{state.errors['logo.dark'][0]}</p>
            )}
          </div>
        </div>

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
