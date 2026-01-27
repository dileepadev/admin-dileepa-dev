"use client";

import { useActionState } from "react";
import { createCommunity, updateCommunity, CommunityFormData, ActionState } from "@/app/actions/communities";
import { Loader2, Save, X } from "lucide-react";

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
    { success: false, message: "", errors: {} }
  );

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {initialData ? "Edit Community" : "Add New Community"}
        </h2>
        <button
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Community Name
            </label>
            <input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter community name"
              required
            />
            {state.errors?.name && (
              <p className="text-red-500 text-sm">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <input
              id="role"
              name="role"
              defaultValue={initialData?.role}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., Founding Member & President"
              required
            />
            {state.errors?.role && (
              <p className="text-red-500 text-sm">{state.errors.role[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="period" className="text-sm font-medium">
              Period
            </label>
            <input
              id="period"
              name="period"
              defaultValue={initialData?.period}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., Oct 2022 - Dec 2023"
              required
            />
            {state.errors?.period && (
              <p className="text-red-500 text-sm">{state.errors.period[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Currently Involved
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="current"
                name="current"
                type="checkbox"
                defaultChecked={initialData?.current}
                className="h-4 w-4 rounded border border-input bg-background ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <label htmlFor="current" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Currently active in this community
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={initialData?.description}
            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Describe your involvement in this community"
            required
          />
          {state.errors?.description && (
            <p className="text-red-500 text-sm">{state.errors.description[0]}</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Community Logo</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="logo.light" className="text-sm font-medium">
                Light Mode Logo URL
              </label>
              <input
                id="logo.light"
                name="logo.light"
                type="url"
                defaultValue={initialData?.logo?.light}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="https://example.com/logo-light.svg"
                required
              />
              {state.errors?.["logo.light"] && (
                <p className="text-red-500 text-sm">{state.errors["logo.light"][0]}</p>
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="https://example.com/logo-dark.svg"
                required
              />
              {state.errors?.["logo.dark"] && (
                <p className="text-red-500 text-sm">{state.errors["logo.dark"][0]}</p>
              )}
            </div>
          </div>
        </div>

        {state.message && !state.success && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{state.message}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            disabled={isPending}
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
                Save Community
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}