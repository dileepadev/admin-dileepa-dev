'use client';

import { useEffect, useState, useCallback } from 'react';
import { getVideos, deleteVideo, VideoFormData } from '@/app/actions/videos';
import { VideoForm } from './video-form';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Play,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';

export function VideosList() {
  const [data, setData] = useState<VideoFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoFormData | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const videos = await getVideos();
      videos.sort((a, b) => {
        const ta = new Date(a.date).getTime() || 0;
        const tb = new Date(b.date).getTime() || 0;
        return sortOrder === 'desc' ? tb - ta : ta - tb;
      });
      setData(videos);
    } catch (error) {
      console.error('Failed to load videos', error);
    } finally {
      setLoading(false);
    }
  }, [sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setSelectedVideo(undefined);
    setIsEditing(true);
  };

  const handleEdit = (video: VideoFormData) => {
    setSelectedVideo(video);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    setDeletingId(id);
    try {
      const result = await deleteVideo(id);
      if (result.success) {
        await loadData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to delete video', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = async () => {
    setIsEditing(false);
    setSelectedVideo(undefined);
    await loadData();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedVideo(undefined);
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
      <VideoForm initialData={selectedVideo} onSuccess={handleSuccess} onCancel={handleCancel} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Videos List</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = sortOrder === 'desc' ? 'asc' : 'desc';
              setSortOrder(next);
              setData((prev) => {
                const copy = [...prev];
                copy.sort((a, b) => {
                  const ta = new Date(a.date).getTime() || 0;
                  const tb = new Date(b.date).getTime() || 0;
                  return next === 'desc' ? tb - ta : ta - tb;
                });
                return copy;
              });
            }}
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
            Add Video
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {data.map((video) => (
          <div
            key={video._id}
            className="bg-card border-border flex flex-col items-start justify-between gap-4 rounded-lg border p-6 shadow-sm md:flex-row md:items-center"
          >
            {video.thumbnail && (
              <div className="bg-muted border-border relative aspect-video w-32 shrink-0 overflow-hidden rounded border">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  unoptimized
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">{video.title}</h3>

              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{video.date ? new Date(video.date).toISOString().slice(0, 10) : ''}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={video.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Play className="h-4 w-4" />
                  Watch Video
                </a>
              </div>
            </div>

            <div className="mt-4 flex w-full items-center gap-2 md:mt-0 md:w-auto">
              <button
                onClick={() => handleEdit(video)}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(video._id!)}
                disabled={deletingId === video._id}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-destructive hover:text-destructive-foreground text-destructive inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                title="Delete"
              >
                {deletingId === video._id ? (
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
            <p className="text-muted-foreground">No videos found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
