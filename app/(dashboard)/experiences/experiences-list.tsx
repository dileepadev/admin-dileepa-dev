'use client';

import { useEffect, useState } from 'react';
import { getExperiences, deleteExperience, ExperienceFormData } from '@/app/actions/experiences';
import { ExperienceForm } from './experience-form';
import { Loader2, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/providers/toast-provider';
import { useAlert } from '@/components/providers/alert-provider';

export function ExperiencesList() {
  const [data, setData] = useState<ExperienceFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceFormData | undefined>(
    undefined,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const { push } = useToast();
  const { show } = useAlert();

  const loadData = async () => {
    setLoading(true);
    try {
      const experiences = await getExperiences();
      setData(experiences);
    } catch (error) {
      console.error('Failed to load experiences', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setSelectedExperience(undefined);
    setIsEditing(true);
  };

  const handleEdit = (experience: ExperienceFormData) => {
    setSelectedExperience(experience);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const experienceToDelete = data.find((experience) => experience._id === id);
    const confirmed = await show({
      title: 'Delete Experience',
      message: `Are you sure you want to delete "${experienceToDelete?.title}"? This action cannot be undone.`,
      variant: 'danger',
    });

    if (!confirmed) {
      push({
        title: 'Cancelled',
        description: 'No changes made.',
        type: 'info',
        duration: 2500,
      });
      return;
    }

    setDeletingId(id);
    try {
      const result = await deleteExperience(id);
      if (result.success) {
        push({
          title: 'Experience Deleted',
          description: `Experience "${experienceToDelete?.title}" has been deleted successfully.`,
          type: 'success',
          duration: 5000,
        });
        await loadData();
      } else {
        push({
          title: 'Delete Failed',
          description: result.message,
          type: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Failed to delete experience', error);
      push({
        title: 'Delete Failed',
        description: 'An unexpected error occurred while deleting the experience.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = async () => {
    setIsEditing(false);
    setSelectedExperience(undefined);
    await loadData();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedExperience(undefined);
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
      <ExperienceForm
        initialData={selectedExperience}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Experience List - {data.length}</h2>
        <button
          onClick={handleCreate}
          className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </button>
      </div>

      <div className="grid gap-4">
        {data.map((experience) => (
          <div
            key={experience._id}
            className="bg-card border-border flex flex-col items-start justify-between gap-4 rounded-lg border p-6 shadow-sm md:flex-row md:items-center"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-4">
                {(experience.logo?.light || experience.logo?.dark) && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border">
                    <Image
                      src={
                        isDark
                          ? (experience.logo.light ?? experience.logo.dark)
                          : (experience.logo.dark ?? experience.logo.light)
                      }
                      alt={experience.company}
                      fill
                      unoptimized
                      className="object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="text-lg font-semibold">{experience.title}</h3>
                    <span className="text-muted-foreground">@</span>
                    <span className="font-medium">{experience.company}</span>
                    <div
                      className="bg-primary/10 text-primary border-primary/20 flex h-5 items-center justify-center rounded border px-1.5 text-[10px] font-bold tracking-wider uppercase"
                      title="Priority Index"
                    >
                      Index: {experience.index}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{experience.period}</p>
                </div>
              </div>

              <div className="mt-2 ml-0 flex flex-wrap gap-2 md:ml-16">
                {experience.technologies.slice(0, 5).map((tech, i) => (
                  <span
                    key={i}
                    className="focus:ring-ring bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    {tech}
                  </span>
                ))}
                {experience.technologies.length > 5 && (
                  <span className="text-muted-foreground self-center text-xs">
                    +{experience.technologies.length - 5} more
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex w-full items-center gap-2 md:mt-0 md:w-auto">
              {experience.url && (
                <a
                  href={experience.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  title="Visit Company"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button
                onClick={() => handleEdit(experience)}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(experience._id!)}
                disabled={deletingId === experience._id}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-destructive hover:text-destructive-foreground text-destructive inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                title="Delete"
              >
                {deletingId === experience._id ? (
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
            <p className="text-muted-foreground">No experiences found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
