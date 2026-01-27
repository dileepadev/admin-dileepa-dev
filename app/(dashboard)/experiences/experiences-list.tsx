"use client";

import { useEffect, useState } from "react";
import { 
  getExperiences, 
  deleteExperience, 
  ExperienceFormData 
} from "@/app/actions/experiences";
import { ExperienceForm } from "./experience-form";
import { Loader2, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

export function ExperiencesList() {
  const [data, setData] = useState<ExperienceFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceFormData | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const experiences = await getExperiences();
      setData(experiences);
    } catch (error) {
      console.error("Failed to load experiences", error);
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
    if (!confirm("Are you sure you want to delete this experience?")) return;
    
    setDeletingId(id);
    try {
      const result = await deleteExperience(id);
      if (result.success) {
        await loadData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to delete experience", error);
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
        <Loader2 className="animate-spin h-8 w-8" />
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Experience List</h2>
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </button>
      </div>

      <div className="grid gap-4">
        {data.map((experience) => (
          <div
            key={experience._id}
            className="bg-card rounded-lg border border-border p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{experience.title}</h3>
                <span className="text-muted-foreground">@</span>
                <span className="font-medium">{experience.company}</span>
              </div>
              <p className="text-sm text-muted-foreground">{experience.period}</p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {experience.technologies.slice(0, 5).map((tech, i) => (
                  <span key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    {tech}
                  </span>
                ))}
                {experience.technologies.length > 5 && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{experience.technologies.length - 5} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                {experience.url && (
                    <a 
                        href={experience.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
                        title="Visit Company"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
              <button
                onClick={() => handleEdit(experience)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(experience._id!)}
                disabled={deletingId === experience._id}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-destructive hover:text-destructive-foreground h-9 w-9 text-destructive"
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
          <div className="text-center p-8 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No experiences found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
