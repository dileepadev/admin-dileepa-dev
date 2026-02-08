'use client';

import { useActionState, useEffect } from 'react';
import {
  createEducation,
  updateEducation,
  EducationFormData,
  EducationState,
} from '@/app/actions/educations';
import { Loader2, Save, X } from 'lucide-react';
import { ImageUploadField } from '@/components/ui/image-upload-field';

interface EducationFormProps {
  initialData?: EducationFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: EducationState = {
  message: '',
  errors: {},
};

export function EducationForm({ initialData, onSuccess, onCancel }: EducationFormProps) {
  // Bind the ID if updating
  const action = initialData ? updateEducation.bind(null, initialData._id!) : createEducation;

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="bg-card border-border space-y-6 rounded-lg border p-6">
      <p className="text-muted-foreground text-sm">
        All fields are required. Fields marked with <span className="text-red-500">*</span> are
        required.
      </p>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {initialData ? 'Edit Education' : 'Add New Education'}
        </h2>
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
          <label htmlFor="course" className="text-sm font-medium">
            Course/Degree <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="course"
            name="course"
            defaultValue={initialData?.course}
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.course && <p className="text-sm text-red-500">{state.errors.course[0]}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="institution" className="text-sm font-medium">
            Institution <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="institution"
            name="institution"
            defaultValue={initialData?.institution}
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.institution && (
            <p className="text-sm text-red-500">{state.errors.institution[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="period" className="text-sm font-medium">
            Period <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="period"
            name="period"
            defaultValue={initialData?.period}
            aria-required="true"
            placeholder="e.g. 2019 - 2020"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.period && <p className="text-sm text-red-500">{state.errors.period[0]}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Institution URL <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="url"
            name="url"
            defaultValue={initialData?.url}
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.url && <p className="text-sm text-red-500">{state.errors.url[0]}</p>}
        </div>
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
          rows={4}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
        {state.errors?.description && (
          <p className="text-sm text-red-500">{state.errors.description[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <ImageUploadField
            name="logo.light"
            label="Logo (Light Mode) URL"
            defaultValue={initialData?.logo?.light}
            folder="education"
            required
          />
          {state.errors?.['logo.light'] && (
            <p className="text-sm text-red-500">{state.errors['logo.light'][0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <ImageUploadField
            name="logo.dark"
            label="Logo (Dark Mode) URL"
            defaultValue={initialData?.logo?.dark}
            folder="education"
            required
          />
          {state.errors?.['logo.dark'] && (
            <p className="text-sm text-red-500">{state.errors['logo.dark'][0]}</p>
          )}
        </div>
      </div>

      {state.message && (
        <p className={`text-sm ${state.success ? 'text-green-500' : 'text-red-500'}`}>
          {state.message}
        </p>
      )}

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
              Save Education
            </>
          )}
        </button>
      </div>
    </form>
  );
}
