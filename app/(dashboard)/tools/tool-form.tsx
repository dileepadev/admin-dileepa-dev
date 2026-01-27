"use client";

import { useActionState } from "react";
import { createTool, updateTool, ToolFormData, ActionState } from "@/app/actions/tools";
import { Loader2, Save, X } from "lucide-react";

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
    { success: false, message: "", errors: {} }
  );

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {initialData ? "Edit Tool" : "Add New Tool"}
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
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Tool Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={initialData?.name}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g. Next.js"
          />
          {state.errors?.name && (
            <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>
          )}
        </div>

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
              placeholder="https://..."
            />
            {state.errors?.["logo.light"] && (
              <p className="text-sm text-destructive mt-1">
                {state.errors["logo.light"][0]}
              </p>
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
              placeholder="https://..."
            />
            {state.errors?.["logo.dark"] && (
              <p className="text-sm text-destructive mt-1">
                {state.errors["logo.dark"][0]}
              </p>
            )}
          </div>
        </div>

        {state.message && (
          <div
            className={`p-3 rounded-md text-sm ${
              state.success
                ? "bg-green-500/15 text-green-700 dark:text-green-400"
                : "bg-destructive/15 text-destructive"
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
                Save Tool
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
