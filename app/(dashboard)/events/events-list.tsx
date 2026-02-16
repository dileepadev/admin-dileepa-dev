'use client';

import { useEffect, useState, useCallback } from 'react';
import { getEvents, deleteEvent, EventFormData } from '@/app/actions/events';
import { EventForm } from './event-form';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Monitor,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/providers/toast-provider';
import { useAlert } from '@/components/providers/alert-provider';

export function EventsList() {
  const [data, setData] = useState<EventFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventFormData | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { push: pushToast } = useToast();
  const { show: showAlert } = useAlert();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const events = await getEvents();
      setData(events);
    } catch (error) {
      console.error('Failed to load events', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setSelectedEvent(undefined);
    setIsEditing(true);
  };

  const handleEdit = (event: EventFormData) => {
    setSelectedEvent(event);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await showAlert({
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event? This action cannot be undone.',
      variant: 'danger',
    });

    if (!ok) {
      pushToast({
        title: 'Cancelled',
        description: 'No changes made.',
        type: 'info',
        duration: 2500,
      });
      return;
    }

    setDeletingId(id);
    try {
      const result = await deleteEvent(id);
      if (result.success) {
        pushToast({
          title: 'Event Deleted',
          description: 'The event has been successfully deleted.',
          type: 'success',
        });
        await loadData();
      } else {
        pushToast({
          title: 'Delete Failed',
          description: result.message || 'Failed to delete event.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to delete event', error);
      pushToast({
        title: 'Delete Failed',
        description: 'An unexpected error occurred while deleting the event.',
        type: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = async () => {
    setIsEditing(false);
    setSelectedEvent(undefined);
    await loadData();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedEvent(undefined);
  };

  if (loading && !data.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isEditing) {
    return (
      <EventForm initialData={selectedEvent} onSuccess={handleSuccess} onCancel={handleCancel} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Events List - {data.length}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreate}
            className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {data.map((event) => (
          <div
            key={event._id}
            className="bg-card border-border flex flex-col items-start justify-between gap-4 rounded-lg border p-6 shadow-sm md:flex-row md:items-center"
          >
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <div
                  className="bg-primary/10 text-primary border-primary/20 flex h-5 items-center justify-center rounded border px-1.5 text-[10px] font-bold tracking-wider uppercase"
                  title="Priority Index"
                >
                  Index: {event.index}
                </div>
              </div>

              <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date ? new Date(event.date).toISOString().slice(0, 10) : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Monitor className="h-4 w-4" />
                  <span>{event.format}</span>
                </div>
                {event.url && (
                  <div className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Event Link
                    </a>
                  </div>
                )}
              </div>

              <p className="text-sm">{event.description}</p>
            </div>

            <div className="mt-4 flex w-full items-center gap-2 md:mt-0 md:w-auto">
              <button
                onClick={() => handleEdit(event)}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(event._id!)}
                disabled={deletingId === event._id}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-destructive hover:text-destructive-foreground text-destructive inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                title="Delete"
              >
                {deletingId === event._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}

        {!loading && data.length === 0 && (
          <div className="bg-card border-border rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">No events found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
