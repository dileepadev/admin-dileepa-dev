"use client";

import { useActionState, useEffect } from "react";
import { 
  createEducation, 
  updateEducation, 
  EducationFormData, 
  EducationState 
} from "@/app/actions/educations";
import { Loader2, Save, X } from "lucide-react";

interface EducationFormProps {
  initialData?: EducationFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: EducationState = {
  message: "",
  errors: {},
};

export function EducationForm({ initialData, onSuccess, onCancel }: EducationFormProps) {
  // Bind the ID if updating
  const action = initialData 
    ? updateEducation.bind(null, initialData._id!) 
    : createEducation;

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
          {initialData ? "Edit Education" : "Add New Education"}
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
          <label htmlFor="course" className="text-sm font-medium">
            Course/Degree
          </label>
          <input
            id="course"
            name="course"
            defaultValue={initialData?.course}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.course && (
            <p className="text-red-500 text-sm">{state.errors.course[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="institution" className="text-sm font-medium">
            Institution
          </label>
          <input
            id="institution"
            name="institution"
            defaultValue={initialData?.institution}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.institution && (
            <p className="text-red-500 text-sm">{state.errors.institution[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="period" className="text-sm font-medium">
            Period
          </label>
          <input
            id="period"
            name="period"
            defaultValue={initialData?.period}
            placeholder="e.g. 2019 - 2020"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.period && (
            <p className="text-red-500 text-sm">{state.errors.period[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Institution URL
          </label>
          <input
            id="url"
            name="url"
            defaultValue={initialData?.url}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.url && (
            <p className="text-red-500 text-sm">{state.errors.url[0]}</p>
          )}
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
          rows={4}
          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
        {state.errors?.description && (
          <p className="text-red-500 text-sm">{state.errors.description[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="logo.light" className="text-sm font-medium">
            Logo (Light Mode) URL
          </label>
          <input
            id="logo.light"
            name="logo.light"
            defaultValue={initialData?.logo?.light}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.["logo.light"] && (
            <p className="text-red-500 text-sm">{state.errors["logo.light"][0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="logo.dark" className="text-sm font-medium">
            Logo (Dark Mode) URL
          </label>
          <input
            id="logo.dark"
            name="logo.dark"
            defaultValue={initialData?.logo?.dark}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.["logo.dark"] && (
            <p className="text-red-500 text-sm">{state.errors["logo.dark"][0]}</p>
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
              Save Education
            </>
          )}
        </button>
      </div>
    </form>
  );
}
