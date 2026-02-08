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
} from 'lucide-react';
import { useToast } from '@/components/providers/toast-provider';
import { useAlert } from '@/components/providers/alert-provider';

export function EventsList() {
  const [data, setData] = useState<EventFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventFormData | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { push: pushToast } = useToast();
  const { show: showAlert } = useAlert();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const events = await getEvents();
      // sort events by date according to sortOrder (initial load uses initial sortOrder)
      events.sort((a, b) => {
        const ta = new Date(a.date).getTime() || 0;
        const tb = new Date(b.date).getTime() || 0;
        return sortOrder === 'desc' ? tb - ta : ta - tb;
      });
      setData(events);
    } catch (error) {
      console.error('Failed to load events', error);
    } finally {
      setLoading(false);
    }
  }, [sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setSelectedEvent(undefined);
    setIsEditing(true);
  };

  const toggleSort = () => {
    const next = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(next);
    // re-sort currently loaded data
    setData((prev) => {
      const copy = [...prev];
      copy.sort((a, b) => {
        const ta = new Date(a.date).getTime() || 0;
        const tb = new Date(b.date).getTime() || 0;
        return next === 'desc' ? tb - ta : ta - tb;
      });
      return copy;
    });
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
        <h2 className="text-xl font-semibold">Events List</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSort}
            className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            title={sortOrder === 'desc' ? 'Sort: Newest first' : 'Sort: Oldest first'}
          >
            {sortOrder === 'desc' ? (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Newest
              </>
            ) : (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Oldest
              </>
            )}
          </button>
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
              <h3 className="text-lg font-semibold">{event.title}</h3>

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
