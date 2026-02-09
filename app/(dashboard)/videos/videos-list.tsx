'use client';

import { useEffect, useState, useCallback } from 'react';
import { getVideos, deleteVideo, VideoFormData } from '@/app/actions/videos';
import { VideoForm } from './video-form';
import { Loader2, Plus, Pencil, Trash2, Calendar, Play } from 'lucide-react';
import { useToast } from '@/components/providers/toast-provider';
import { useAlert } from '@/components/providers/alert-provider';
import Image from 'next/image';

export function VideosList() {
  const [data, setData] = useState<VideoFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoFormData | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { push: pushToast } = useToast();
  const { show: showAlert } = useAlert();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const videos = await getVideos();
      setData(videos);
    } catch (error) {
      console.error('Failed to load videos', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
    const ok = await showAlert({
      title: 'Delete Video',
      message: 'Are you sure you want to delete this video? This action cannot be undone.',
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
      const result = await deleteVideo(id);
      if (result.success) {
        pushToast({
          title: 'Video Deleted',
          description: 'The video has been successfully deleted.',
          type: 'success',
        });
        await loadData();
      } else {
        pushToast({
          title: 'Delete Failed',
          description: result.message || 'Failed to delete video.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to delete video', error);
      pushToast({
        title: 'Delete Failed',
        description: 'An unexpected error occurred while deleting the video.',
        type: 'error',
      });
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
        <h2 className="text-xl font-semibold">Videos List - {data.length}</h2>
        <div className="flex items-center gap-2">
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
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-lg font-semibold">{video.title}</h3>
                <div
                  className="bg-primary/10 text-primary border-primary/20 flex h-5 items-center justify-center rounded border px-1.5 text-[10px] font-bold tracking-wider uppercase"
                  title="Priority Index"
                >
                  Index: {video.index}
                </div>
              </div>

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
