"use client";

import { useEffect, useState } from "react";
import { 
  getEducations, 
  deleteEducation, 
  EducationFormData 
} from "@/app/actions/educations";
import { EducationForm } from "./education-form";
import { Loader2, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

export function EducationsList() {
  const [data, setData] = useState<EducationFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<EducationFormData | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const educations = await getEducations();
      setData(educations);
    } catch (error) {
      console.error("Failed to load educations", error);
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
    if (!confirm("Are you sure you want to delete this education?")) return;
    
    setDeletingId(id);
    try {
      const result = await deleteEducation(id);
      if (result.success) {
        await loadData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to delete education", error);
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
        <Loader2 className="animate-spin h-8 w-8" />
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Education List</h2>
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Education
        </button>
      </div>

      <div className="grid gap-4">
        {data.map((education) => (
          <div
            key={education._id}
            className="bg-card rounded-lg border border-border p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{education.course}</h3>
                <span className="text-muted-foreground">@</span>
                <span className="font-medium">{education.institution}</span>
              </div>
              <p className="text-sm text-muted-foreground">{education.period}</p>
              <p className="text-sm">{education.description}</p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                {education.url && (
                    <a 
                        href={education.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
                        title="Visit Institution"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
              <button
                onClick={() => handleEdit(education)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(education._id!)}
                disabled={deletingId === education._id}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-destructive hover:text-destructive-foreground h-9 w-9 text-destructive"
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
          <div className="text-center p-8 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No educations found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
