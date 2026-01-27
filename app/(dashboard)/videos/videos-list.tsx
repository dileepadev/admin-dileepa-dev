"use client";

import { useEffect, useState } from "react";
import { 
  getVideos, 
  deleteVideo, 
  VideoFormData 
} from "@/app/actions/videos";
import { VideoForm } from "./video-form";
import { Loader2, Plus, Pencil, Trash2, Calendar, Play } from "lucide-react";

export function VideosList() {
  const [data, setData] = useState<VideoFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoFormData | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const videos = await getVideos();
      setData(videos);
    } catch (error) {
      console.error("Failed to load videos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setSelectedVideo(undefined);
    setIsEditing(true);
  };

  const handleEdit = (video: VideoFormData) => {
    setSelectedVideo(video);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    
    setDeletingId(id);
    try {
      const result = await deleteVideo(id);
      if (result.success) {
        await loadData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to delete video", error);
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
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (isEditing) {
    return (
      <VideoForm 
        initialData={selectedVideo} 
        onSuccess={handleSuccess} 
        onCancel={handleCancel} 
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Videos List</h2>
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Video
        </button>
      </div>

      <div className="grid gap-4">
        {data.map((video) => (
          <div
            key={video._id}
            className="bg-card rounded-lg border border-border p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm"
          >
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">{video.title}</h3>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(video.date).toLocaleDateString()}</span>
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

            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={() => handleEdit(video)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(video._id!)}
                disabled={deletingId === video._id}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-destructive hover:text-destructive-foreground h-9 w-9 text-destructive"
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
          <div className="text-center p-8 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No videos found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
