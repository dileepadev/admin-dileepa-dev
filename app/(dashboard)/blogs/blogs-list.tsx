'use client';

import { useEffect, useState, useCallback } from 'react';
import { getBlogs, deleteBlog, BlogFormData } from '@/app/actions/blogs';
import { BlogForm } from './blog-form';
import { Loader2, Plus, Pencil, Trash2, Calendar, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/providers/toast-provider';
import { useAlert } from '@/components/providers/alert-provider';

export function BlogsList() {
  const [data, setData] = useState<BlogFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogFormData | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { push } = useToast();
  const { show } = useAlert();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const blogs = await getBlogs();
      setData(blogs);
    } catch (error) {
      console.error('Failed to load blogs', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setSelectedBlog(undefined);
    setIsEditing(true);
  };

  const handleEdit = (blog: BlogFormData) => {
    setSelectedBlog(blog);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const blogToDelete = data.find((blog) => blog._id === id);
    const confirmed = await show({
      title: 'Delete Blog Post',
      message: `Are you sure you want to delete "${blogToDelete?.title}"? This action cannot be undone.`,
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
      const result = await deleteBlog(id);
      if (result.success) {
        push({
          title: 'Blog Deleted',
          description: `Blog "${blogToDelete?.title}" has been deleted successfully.`,
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
      console.error('Failed to delete blog', error);
      push({
        title: 'Delete Failed',
        description: 'An unexpected error occurred while deleting the blog.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = async () => {
    setIsEditing(false);
    setSelectedBlog(undefined);
    await loadData();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedBlog(undefined);
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
      <BlogForm initialData={selectedBlog} onSuccess={handleSuccess} onCancel={handleCancel} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Blogs List - {data.length}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreate}
            className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Blog
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {data.map((blog) => (
          <div
            key={blog._id}
            className="bg-card border-border flex flex-col gap-4 rounded-lg border p-6 shadow-sm"
          >
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-lg font-semibold">{blog.title}</h3>
                <div
                  className="bg-primary/10 text-primary border-primary/20 flex h-5 items-center justify-center rounded border px-1.5 text-[10px] font-bold tracking-wider uppercase"
                  title="Priority Index"
                >
                  Index: {blog.index}
                </div>
              </div>

              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{blog.date ? new Date(blog.date).toISOString().slice(0, 10) : ''}</span>
              </div>

              <p className="text-muted-foreground line-clamp-2 text-sm">{blog.excerpt}</p>

              <div className="flex items-center gap-2">
                <a
                  href={blog.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  Read Blog Post
                </a>
              </div>
            </div>

            <div className="mt-4 flex w-full items-center justify-end gap-2">
              <button
                onClick={() => handleEdit(blog)}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(blog._id!)}
                disabled={deletingId === blog._id}
                className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-destructive hover:text-destructive-foreground text-destructive inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                title="Delete"
              >
                {deletingId === blog._id ? (
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
            <p className="text-muted-foreground">No blog posts found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
