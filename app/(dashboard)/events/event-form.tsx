'use client';

import { useActionState, useEffect } from 'react';
import { createEvent, updateEvent, EventFormData, EventState } from '@/app/actions/events';
import { Loader2, Save, X } from 'lucide-react';
import { useToast } from '@/components/providers/toast-provider';

interface EventFormProps {
  initialData?: EventFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: EventState = {
  message: '',
  errors: {},
};

export function EventForm({ initialData, onSuccess, onCancel }: EventFormProps) {
  // Bind the ID if updating
  const action = initialData ? updateEvent.bind(null, initialData._id!) : createEvent;

  const [state, formAction, isPending] = useActionState(action, initialState);
  const { push: pushToast } = useToast();

  useEffect(() => {
    if (state.success) {
      pushToast({
        title: initialData ? 'Event Updated' : 'Event Created',
        description:
          state.message || `Event has been successfully ${initialData ? 'updated' : 'created'}.`,
        type: 'success',
      });
      onSuccess();
    } else if (state.message && !state.success) {
      pushToast({
        title: 'Operation Failed',
        description: state.message,
        type: 'error',
      });
    }
  }, [state.success, state.message, onSuccess, pushToast, initialData]);

  return (
    <form action={formAction} className="bg-card border-border space-y-6 rounded-lg border p-6">
      <p className="text-muted-foreground text-sm">
        All fields are required. Fields marked with <span className="text-red-500">*</span> are
        required.
      </p>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{initialData ? 'Edit Event' : 'Add New Event'}</h2>
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
          <label htmlFor="index" className="text-sm font-medium">
            Priority Index
          </label>
          <input
            id="index"
            name="index"
            type="number"
            defaultValue={initialData?.index ?? 0}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          {state.errors?.index && <p className="text-sm text-red-500">{state.errors.index[0]}</p>}
        </div>
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
            required
          />
          {state.errors?.title && <p className="text-sm text-red-500">{state.errors.title[0]}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">
            Date <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={
              initialData?.date ? new Date(initialData.date).toISOString().slice(0, 10) : undefined
            }
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.date && <p className="text-sm text-red-500">{state.errors.date[0]}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="location"
            name="location"
            defaultValue={initialData?.location}
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {state.errors?.location && (
            <p className="text-sm text-red-500">{state.errors.location[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="format" className="text-sm font-medium">
            Format <span className="ml-1 text-red-500">*</span>
          </label>
          <select
            id="format"
            name="format"
            defaultValue={initialData?.format}
            aria-required="true"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select format</option>
            <option value="In-Person">In-Person</option>
            <option value="Online">Online</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          {state.errors?.format && <p className="text-sm text-red-500">{state.errors.format[0]}</p>}
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
              Save Event
            </>
          )}
        </button>
      </div>
    </form>
  );
}
