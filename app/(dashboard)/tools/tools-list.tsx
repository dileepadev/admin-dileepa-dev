'use client';

import { useEffect, useState } from 'react';
import { getTools, deleteTool, ToolFormData } from '@/app/actions/tools';
import { Edit, Trash2, Plus, PenTool, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { ToolForm } from './tool-form';

export function ToolsList() {
  const [tools, setTools] = useState<ToolFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolFormData | undefined>(undefined);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const fetchTools = async () => {
    try {
      setLoading(true);
      const data = await getTools();
      setTools(data);
    } catch {
      setError('Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleEdit = (tool: ToolFormData) => {
    setCurrentTool(tool);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      const result = await deleteTool(id);
      if (result.success) {
        fetchTools();
      } else {
        alert(result.message);
      }
    } catch {
      alert('Failed to delete tool');
    }
  };

  const handleSuccess = () => {
    setIsEditing(false);
    setCurrentTool(undefined);
    fetchTools();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="bg-destructive/15 text-destructive rounded-md p-4">{error}</div>;
  }

  if (isEditing) {
    return (
      <ToolForm
        initialData={currentTool}
        onSuccess={handleSuccess}
        onCancel={() => {
          setIsEditing(false);
          setCurrentTool(undefined);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setCurrentTool(undefined);
            setIsEditing(true);
          }}
          className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Tool
        </button>
      </div>

      <div className="border-border rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                  Tool
                </th>
                <th className="text-muted-foreground h-12 px-4 text-right align-middle font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {tools.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted-foreground p-4 text-center">
                    No tools found. Add one to get started.
                  </td>
                </tr>
              ) : (
                tools.map((tool) => (
                  <tr
                    key={tool._id}
                    className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                  >
                    <td className="p-4 align-middle font-medium">
                      <div className="flex items-center gap-3">
                        {tool.logo?.light || tool.logo?.dark ? (
                          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border">
                            <Image
                              src={
                                isDark
                                  ? (tool.logo.light ?? tool.logo.dark)
                                  : (tool.logo.dark ?? tool.logo.light)
                              }
                              alt={tool.name}
                              fill
                              unoptimized
                              className="object-contain p-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <PenTool className="text-muted-foreground h-16 w-16" />
                        )}
                        {tool.name}
                      </div>
                    </td>
                    <td className="p-4 text-right align-middle">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tool)}
                          className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => tool._id && handleDelete(tool._id)}
                          className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-destructive hover:text-destructive-foreground inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
