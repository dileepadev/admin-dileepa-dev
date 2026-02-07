'use client';

import { useEffect, useState } from 'react';
import { getCommunities, deleteCommunity, CommunityFormData } from '@/app/actions/communities';
import { CommunityForm } from './community-form';
import { Loader2, Plus, Pencil, Trash2, Calendar, CheckCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export function CommunitiesList() {
  const [data, setData] = useState<CommunityFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityFormData | undefined>(
    undefined,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const loadData = async () => {
    setLoading(true);
    try {
      const communities = await getCommunities();
      setData(communities);
    } catch (error) {
      console.error('Failed to load communities', error);
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
    if (!confirm('Are you sure you want to delete this community?')) return;

    setDeletingId(id);
    try {
      const result = await deleteCommunity(id);
      if (result.success) {
        await loadData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to delete community', error);
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
        <Loader2 className="h-8 w-8 animate-spin" />
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Communities List</h2>
        <button
          onClick={handleCreate}
          className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Community
        </button>
      </div>

      <div className="grid gap-4">
        {data.map((community) => (
          <div
            key={community._id}
            className="bg-card border-border flex flex-col gap-4 rounded-lg border p-6 shadow-sm"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-4">
                {(community.logo?.light || community.logo?.dark) && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border">
                    <Image
                      src={
                        isDark
                          ? (community.logo.light ?? community.logo.dark)
                          : (community.logo.dark ?? community.logo.light)
                      }
                      alt={community.name}
                      fill
                      unoptimized
                      className="object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{community.name}</h3>
                    {community.current && (
                      <span title="Currently active">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">{community.role}</p>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{community.period}</span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground line-clamp-2 text-sm">{community.description}</p>
            </div>

            <div className="mt-4 flex w-full items-center justify-end gap-2">
              {community.communityUrl && (
                <a
                  href={community.communityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  title="Visit Community"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button
                onClick={() => handleEdit(community)}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(community._id!)}
                disabled={deletingId === community._id}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-destructive hover:text-destructive-foreground text-destructive inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
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
          <div className="bg-card border-border rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">No communities found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
