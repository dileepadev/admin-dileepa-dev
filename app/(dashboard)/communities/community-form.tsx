'use client';

import { useActionState } from 'react';
import {
  createCommunity,
  updateCommunity,
  CommunityFormData,
  ActionState,
} from '@/app/actions/communities';
import { Loader2, Save, X } from 'lucide-react';
import { ImageUploadField } from '@/components/ui/image-upload-field';

interface CommunityFormProps {
  initialData?: CommunityFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CommunityForm({ initialData, onSuccess, onCancel }: CommunityFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = initialData?._id
        ? await updateCommunity(initialData._id, formData)
        : await createCommunity(formData);

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
        <h2 className="text-xl font-semibold">
          {initialData ? 'Edit Community' : 'Add New Community'}
        </h2>
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
            <label htmlFor="name" className="text-sm font-medium">
              Community Name <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              aria-required="true"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter community name"
              required
            />
            {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              id="role"
              name="role"
              defaultValue={initialData?.role}
              aria-required="true"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., Founding Member & President"
              required
            />
            {state.errors?.role && <p className="text-sm text-red-500">{state.errors.role[0]}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="period" className="text-sm font-medium">
              Period <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              id="period"
              name="period"
              defaultValue={initialData?.period}
              aria-required="true"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., Oct 2022 - Dec 2023"
              required
            />
            {state.errors?.period && (
              <p className="text-sm text-red-500">{state.errors.period[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Currently Involved</label>
            <div className="flex items-center space-x-2">
              <input
                id="current"
                name="current"
                type="checkbox"
                defaultChecked={initialData?.current}
                className="border-input bg-background ring-offset-background focus:ring-ring h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2"
              />
              <label
                htmlFor="current"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Currently active in this community
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="communityUrl" className="text-sm font-medium">
            Community URL <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="communityUrl"
            name="communityUrl"
            defaultValue={initialData?.communityUrl}
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g., https://example.com"
            required
          />
          {state.errors?.communityUrl && (
            <p className="text-sm text-red-500">{state.errors.communityUrl[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description <span className="ml-1 text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={initialData?.description}
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Describe your involvement in this community"
            required
          />
          {state.errors?.description && (
            <p className="text-sm text-red-500">{state.errors.description[0]}</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Community Logo</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <ImageUploadField
                name="logo.light"
                label="Light Mode Logo"
                defaultValue={initialData?.logo?.light}
                folder="communities"
                required
              />
              {state.errors?.['logo.light'] && (
                <p className="text-sm text-red-500">{state.errors['logo.light'][0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <ImageUploadField
                name="logo.dark"
                label="Dark Mode Logo"
                defaultValue={initialData?.logo?.dark}
                folder="communities"
                required
              />
              {state.errors?.['logo.dark'] && (
                <p className="text-sm text-red-500">{state.errors['logo.dark'][0]}</p>
              )}
            </div>
          </div>
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
                Save Community
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
