'use client';

import { useEffect, useState } from 'react';
import { getEducations, deleteEducation, EducationFormData } from '@/app/actions/educations';
import { EducationForm } from './education-form';
import { Loader2, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/providers/toast-provider';
import { useAlert } from '@/components/providers/alert-provider';

export function EducationsList() {
  const [data, setData] = useState<EducationFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<EducationFormData | undefined>(
    undefined,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { push: pushToast } = useToast();
  const { show: showAlert } = useAlert();

  const loadData = async () => {
    setLoading(true);
    try {
      const educations = await getEducations();
      setData(educations);
    } catch (error) {
      console.error('Failed to load educations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setSelectedEducation(undefined);
    setIsEditing(true);
  };

  const handleEdit = (education: EducationFormData) => {
    setSelectedEducation(education);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await showAlert({
      title: 'Delete Education',
      message: 'Are you sure you want to delete this education? This action cannot be undone.',
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
      const result = await deleteEducation(id);
      if (result.success) {
        pushToast({
          title: 'Education Deleted',
          description: 'The education has been successfully deleted.',
          type: 'success',
        });
        await loadData();
      } else {
        pushToast({
          title: 'Delete Failed',
          description: result.message || 'Failed to delete education.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to delete education', error);
      pushToast({
        title: 'Delete Failed',
        description: 'An unexpected error occurred while deleting the education.',
        type: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = async () => {
    setIsEditing(false);
    setSelectedEducation(undefined);
    await loadData();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedEducation(undefined);
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
      <EducationForm
        initialData={selectedEducation}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Education List</h2>
        <button
          onClick={handleCreate}
          className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Education
        </button>
      </div>

      <div className="grid gap-4">
        {data.map((education) => (
          <div
            key={education._id}
            className="bg-card border-border flex flex-col items-start justify-between gap-4 rounded-lg border p-6 shadow-sm md:flex-row md:items-center"
          >
            {(education.logo?.light || education.logo?.dark) && (
              <div className="bg-muted border-border relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border">
                <Image
                  src={
                    isDark
                      ? (education.logo.light ?? education.logo.dark)
                      : (education.logo.dark ?? education.logo.light)
                  }
                  alt={education.institution}
                  fill
                  unoptimized
                  className="object-contain p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{education.course}</h3>
                <span className="text-muted-foreground">@</span>
                <span className="font-medium">{education.institution}</span>
              </div>
              <p className="text-muted-foreground text-sm">{education.period}</p>
              <p className="text-sm">{education.description}</p>
            </div>

            <div className="mt-4 flex w-full items-center gap-2 md:mt-0 md:w-auto">
              {education.url && (
                <a
                  href={education.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  title="Visit Institution"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button
                onClick={() => handleEdit(education)}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(education._id!)}
                disabled={deletingId === education._id}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-destructive hover:text-destructive-foreground text-destructive inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                title="Delete"
              >
                {deletingId === education._id ? (
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
            <p className="text-muted-foreground">No educations found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
