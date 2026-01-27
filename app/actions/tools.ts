"use server";

import { z, ZodIssue } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const logoSchema = z.object({
  light: z.string().url("Light logo must be a valid URL"),
  dark: z.string().url("Dark logo must be a valid URL"),
});

const toolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo: logoSchema,
});

export type ToolFormData = z.infer<typeof toolSchema> & { _id?: string };

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function getTools(): Promise<ToolFormData[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/tools`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tools: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tools:", error);
    throw new Error("Failed to fetch tools");
  }
}

export async function createTool(formData: FormData): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const rawData = {
      name: formData.get("name") as string,
      logo: {
        light: formData.get("logo.light") as string,
        dark: formData.get("logo.dark") as string,
      },
    };

    const validation = toolSchema.safeParse(rawData);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const logoErrors = validation.error.issues.filter((error: ZodIssue) => error.path.includes('logo'));
      
      return {
        success: false,
        message: "Validation failed",
        errors: {
          ...fieldErrors,
          "logo.light": logoErrors.filter((e: ZodIssue) => e.path.includes('light')).map((e: ZodIssue) => e.message),
          "logo.dark": logoErrors.filter((e: ZodIssue) => e.path.includes('dark')).map((e: ZodIssue) => e.message),
        },
      };
    }

    const response = await fetch(`${API_BASE_URL}/tools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `Failed to create tool: ${response.statusText}`,
      };
    }

    revalidatePath("/dashboard/tools");
    return { success: true, message: "Tool created successfully" };
  } catch (error) {
    console.error("Error creating tool:", error);
    return { success: false, message: "Failed to create tool" };
  }
}

export async function updateTool(id: string, formData: FormData): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const rawData = {
      name: formData.get("name") as string,
      logo: {
        light: formData.get("logo.light") as string,
        dark: formData.get("logo.dark") as string,
      },
    };

    const validation = toolSchema.safeParse(rawData);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const logoErrors = validation.error.issues.filter((error: ZodIssue) => error.path.includes('logo'));
      
      return {
        success: false,
        message: "Validation failed",
        errors: {
          ...fieldErrors,
          "logo.light": logoErrors.filter((e: ZodIssue) => e.path.includes('light')).map((e: ZodIssue) => e.message),
          "logo.dark": logoErrors.filter((e: ZodIssue) => e.path.includes('dark')).map((e: ZodIssue) => e.message),
        },
      };
    }

    const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `Failed to update tool: ${response.statusText}`,
      };
    }

    revalidatePath("/dashboard/tools");
    return { success: true, message: "Tool updated successfully" };
  } catch (error) {
    console.error("Error updating tool:", error);
    return { success: false, message: "Failed to update tool" };
  }
}

export async function deleteTool(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `Failed to delete tool: ${response.statusText}`,
      };
    }

    revalidatePath("/dashboard/tools");
    return { success: true, message: "Tool deleted successfully" };
  } catch (error) {
    console.error("Error deleting tool:", error);
    return { success: false, message: "Failed to delete tool" };
  }
}
