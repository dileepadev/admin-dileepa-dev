"use server";

import { z, ZodIssue } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const logoSchema = z.object({
  light: z.string().url("Light logo must be a valid URL"),
  dark: z.string().url("Dark logo must be a valid URL"),
});

const communitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  period: z.string().min(1, "Period is required"),
  description: z.string().min(1, "Description is required"),
  logo: logoSchema,
  current: z.boolean().optional(),
});

export type CommunityFormData = z.infer<typeof communitySchema> & { _id?: string };

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function getCommunities(): Promise<CommunityFormData[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/communities`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch communities: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw new Error("Failed to fetch communities");
  }
}

export async function createCommunity(formData: FormData): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const rawData = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      period: formData.get("period") as string,
      description: formData.get("description") as string,
      logo: {
        light: formData.get("logo.light") as string,
        dark: formData.get("logo.dark") as string,
      },
      current: formData.get("current") === "on",
    };

    const validation = communitySchema.safeParse(rawData);
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

    const response = await fetch(`${API_BASE_URL}/communities`, {
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
        message: errorData.message || `Failed to create community: ${response.statusText}`,
      };
    }

    revalidatePath("/dashboard/communities");
    return { success: true, message: "Community created successfully" };
  } catch (error) {
    console.error("Error creating community:", error);
    return { success: false, message: "Failed to create community" };
  }
}

export async function updateCommunity(id: string, formData: FormData): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const rawData = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      period: formData.get("period") as string,
      description: formData.get("description") as string,
      logo: {
        light: formData.get("logo.light") as string,
        dark: formData.get("logo.dark") as string,
      },
      current: formData.get("current") === "on",
    };

    const validation = communitySchema.safeParse(rawData);
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

    const response = await fetch(`${API_BASE_URL}/communities/${id}`, {
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
        message: errorData.message || `Failed to update community: ${response.statusText}`,
      };
    }

    revalidatePath("/dashboard/communities");
    return { success: true, message: "Community updated successfully" };
  } catch (error) {
    console.error("Error updating community:", error);
    return { success: false, message: "Failed to update community" };
  }
}

export async function deleteCommunity(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/communities/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `Failed to delete community: ${response.statusText}`,
      };
    }

    revalidatePath("/dashboard/communities");
    return { success: true, message: "Community deleted successfully" };
  } catch (error) {
    console.error("Error deleting community:", error);
    return { success: false, message: "Failed to delete community" };
  }
}