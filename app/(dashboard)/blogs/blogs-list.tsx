"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getBlogs,
  deleteBlog,
  BlogFormData
} from "@/app/actions/blogs";
import { BlogForm } from "./blog-form";
import { Loader2, Plus, Pencil, Trash2, Calendar, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";

export function BlogsList() {
  const [data, setData] = useState<BlogFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogFormData | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const blogs = await getBlogs();
      // sort blogs by date according to sortOrder
      blogs.sort((a, b) => {
        const ta = new Date(a.date).getTime() || 0;
        const tb = new Date(b.date).getTime() || 0;
        return sortOrder === 'desc' ? tb - ta : ta - tb;
      });
      setData(blogs);
    } catch (error) {
      console.error("Failed to load blogs", error);
    } finally {
      setLoading(false);
    }
  }, [sortOrder]);

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
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    setDeletingId(id);
    try {
      const result = await deleteBlog(id);
      if (result.success) {
        await loadData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to delete blog", error);
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
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (isEditing) {
    return (
      <BlogForm
        initialData={selectedBlog}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Blogs List</h2>
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
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3 py-2"
            title={sortOrder === 'desc' ? 'Sort: Newest first' : 'Sort: Oldest first'}
          >
            {sortOrder === 'desc' ? (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />Newest
              </>
            ) : (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />Oldest
              </>
            )}
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
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
            className="bg-card rounded-lg border border-border p-6 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">{blog.title}</h3>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(blog.date).toLocaleDateString()}</span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {blog.excerpt}
              </p>

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

            <div className="flex items-center gap-2 w-full justify-end mt-4">
              <button
                onClick={() => handleEdit(blog)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(blog._id!)}
                disabled={deletingId === blog._id}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-destructive hover:text-destructive-foreground h-9 w-9 text-destructive"
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
          <div className="text-center p-8 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No blog posts found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
