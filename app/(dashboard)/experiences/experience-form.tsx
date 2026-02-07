'use client';

import { useActionState, useEffect, useState } from 'react';
import {
  createExperience,
  updateExperience,
  ExperienceFormData,
  ExperienceState,
} from '@/app/actions/experiences';
import { Loader2, Plus, Trash2, Save, X } from 'lucide-react';
import { ImageUploadField } from '@/components/ui/image-upload-field';

interface ExperienceFormProps {
  initialData?: ExperienceFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: ExperienceState = {
  message: '',
  errors: {},
};

export function ExperienceForm({ initialData, onSuccess, onCancel }: ExperienceFormProps) {
  // Bind the ID if updating
  const action = initialData ? updateExperience.bind(null, initialData._id!) : createExperience;

  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isUploading, setIsUploading] = useState(false);

  // Local state for array fields which need dynamic UI
  const [technologies, setTechnologies] = useState<string[]>(initialData?.technologies || ['']);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const addTechnology = () => {
    setTechnologies([...technologies, '']);
  };

  const removeTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  const updateTechnology = (index: number, value: string) => {
    const newTechs = [...technologies];
    newTechs[index] = value;
    setTechnologies(newTechs);
  };

  return (
    <form action={formAction} className="bg-card border-border space-y-6 rounded-lg border p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {initialData ? 'Edit Experience' : 'Add New Experience'}
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
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={initialData?.title}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.title && <p className="text-sm text-red-500">{state.errors.title[0]}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium">
            Company
          </label>
          <input
            id="company"
            name="company"
            defaultValue={initialData?.company}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.company && (
            <p className="text-sm text-red-500">{state.errors.company[0]}</p>
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
            placeholder="e.g. 2020 - Present"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.period && <p className="text-sm text-red-500">{state.errors.period[0]}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Company URL
          </label>
          <input
            id="url"
            name="url"
            defaultValue={initialData?.url}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.url && <p className="text-sm text-red-500">{state.errors.url[0]}</p>}
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
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
        {state.errors?.description && (
          <p className="text-sm text-red-500">{state.errors.description[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ImageUploadField
          label="Logo (Light Mode) URL"
          name="logo.light"
          defaultValue={initialData?.logo?.light}
          required
          folder="experiences"
          error={state.errors?.['logo.light']?.[0]}
          onUploadingChange={(val) => setIsUploading(val)}
        />

        <ImageUploadField
          label="Logo (Dark Mode) URL"
          name="logo.dark"
          defaultValue={initialData?.logo?.dark}
          required
          folder="experiences"
          error={state.errors?.['logo.dark']?.[0]}
          onUploadingChange={(val) => setIsUploading(val)}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Technologies</label>
          <button
            type="button"
            onClick={addTechnology}
            className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Tech
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {technologies.map((tech, index) => (
            <div key={index} className="flex gap-2">
              <input
                name="technologies"
                value={tech}
                onChange={(e) => updateTechnology(index, e.target.value)}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Technology name"
                required
              />
              {technologies.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTechnology(index)}
                  className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-destructive inline-flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {state.errors?.technologies && (
          <p className="text-sm text-red-500">{state.errors.technologies[0]}</p>
        )}
      </div>

      {state.message && (
        <p className={`text-sm ${state.success ? 'text-green-500' : 'text-red-500'}`}>
          {state.message}
        </p>
      )}

      {isUploading && (
        <p className="text-muted-foreground text-sm">
          Uploading images... please wait before saving.
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
          disabled={isPending || isUploading}
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
              Save Experience
            </>
          )}
        </button>
      </div>
    </form>
  );
}
