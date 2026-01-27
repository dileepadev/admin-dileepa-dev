"use client";

import { useEffect, useState } from "react";
import { getTools, deleteTool, ToolFormData } from "@/app/actions/tools";
import { Edit, Trash2, Plus, PenTool, Loader2 } from "lucide-react";
import { ToolForm } from "./tool-form";

export function ToolsList() {
  const [tools, setTools] = useState<ToolFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolFormData | undefined>(undefined);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const data = await getTools();
      setTools(data);
    } catch {
      setError("Failed to load tools");
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
    if (!confirm("Are you sure you want to delete this tool?")) return;

    try {
      const result = await deleteTool(id);
      if (result.success) {
        fetchTools();
      } else {
        alert(result.message);
      }
    } catch {
      alert("Failed to delete tool");
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive">
        {error}
      </div>
    );
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
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Tool
        </button>
      </div>

      <div className="rounded-md border border-border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tool
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {tools.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    No tools found. Add one to get started.
                  </td>
                </tr>
              ) : (
                tools.map((tool) => (
                  <tr
                    key={tool._id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">
                      <div className="flex items-center gap-2">
                        <PenTool className="h-4 w-4 text-muted-foreground" />
                        {tool.name}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tool)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => tool._id && handleDelete(tool._id)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-destructive hover:text-destructive-foreground h-8 w-8"
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
