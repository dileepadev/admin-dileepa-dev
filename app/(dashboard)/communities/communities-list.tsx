"use client";

import { useEffect, useState } from "react";
import {
  getCommunities,
  deleteCommunity,
  CommunityFormData
} from "@/app/actions/communities";
import { CommunityForm } from "./community-form";
import { Loader2, Plus, Pencil, Trash2, Calendar, CheckCircle } from "lucide-react";

export function CommunitiesList() {
  const [data, setData] = useState<CommunityFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityFormData | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const communities = await getCommunities();
      setData(communities);
    } catch (error) {
      console.error("Failed to load communities", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setSelectedCommunity(undefined);
    setIsEditing(true);
  };

  const handleEdit = (community: CommunityFormData) => {
    setSelectedCommunity(community);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this community?")) return;

    setDeletingId(id);
    try {
      const result = await deleteCommunity(id);
      if (result.success) {
        await loadData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to delete community", error);
    } finally {
        setDeletingId(null);
    }
  };

  const handleSuccess = async () => {
    setIsEditing(false);
    setSelectedCommunity(undefined);
    await loadData();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedCommunity(undefined);
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
      <CommunityForm
        initialData={selectedCommunity}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Communities List</h2>
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Community
        </button>
      </div>

      <div className="grid gap-4">
        {data.map((community) => (
          <div
            key={community._id}
            className="bg-card rounded-lg border border-border p-6 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{community.name}</h3>
                    {community.current && (
                      <span title="Currently active">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{community.role}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{community.period}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {community.description}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full justify-end mt-4">
              <button
                onClick={() => handleEdit(community)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(community._id!)}
                disabled={deletingId === community._id}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-destructive hover:text-destructive-foreground h-9 w-9 text-destructive"
                title="Delete"
              >
                {deletingId === community._id ? (
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
            <p className="text-muted-foreground">No communities found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}