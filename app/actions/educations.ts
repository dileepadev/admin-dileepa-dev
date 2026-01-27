"use server";

import { z } from "zod";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const urlField = (message: string) =>
  z.string().refine(isValidUrl, { message });

const logoSchema = z.object({
  light: urlField("Invalid light logo URL"),
  dark: urlField("Invalid dark logo URL"),
});

const educationSchema = z.object({
  _id: z.string().optional(),
  course: z.string().min(1, "Course is required"),
  institution: z.string().min(1, "Institution is required"),
  period: z.string().min(1, "Period is required"),
  description: z.string().min(1, "Description is required"),
  url: urlField("Invalid Institution URL"),
  logo: logoSchema,
});

export type EducationFormData = z.infer<typeof educationSchema>;

export type EducationState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

const API_URL = process.env.API_URL || "http://localhost:3000";

export async function getEducations(): Promise<EducationFormData[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const response = await fetch(`${API_URL}/educations`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch educations:", response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching educations:", error);
    return [];
  }
}

export async function createEducation(
  prevState: EducationState,
  formData: FormData
): Promise<EducationState> {
  const session = await getSession();
  if (!session) {
    return { message: "Unauthorized" };
  }

  const rawData = {
    course: formData.get("course"),
    institution: formData.get("institution"),
    period: formData.get("period"),
    description: formData.get("description"),
    url: formData.get("url"),
    logo: {
      light: formData.get("logo.light"),
      dark: formData.get("logo.dark"),
    },
  };

  const validatedFields = educationSchema.omit({ _id: true }).safeParse(rawData);

  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};
    validatedFields.error.issues.forEach((issue: z.ZodIssue) => {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    });
    return { errors: fieldErrors, message: "Validation failed" };
  }

  try {
    const response = await fetch(`${API_URL}/educations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error Response:", errorData);
      return { message: `Failed to create education: ${response.statusText}` };
    }

    revalidatePath("/educations");
    return { message: "Education created successfully", success: true };
  } catch (error) {
    console.error("Error creating education:", error);
    return { message: "Failed to create education" };
  }
}

export async function updateEducation(
  id: string,
  prevState: EducationState,
  formData: FormData
): Promise<EducationState> {
  const session = await getSession();
  if (!session) {
    return { message: "Unauthorized" };
  }

  const rawData = {
    course: formData.get("course"),
    institution: formData.get("institution"),
    period: formData.get("period"),
    description: formData.get("description"),
    url: formData.get("url"),
    logo: {
      light: formData.get("logo.light"),
      dark: formData.get("logo.dark"),
    },
  };

  const validatedFields = educationSchema.omit({ _id: true }).safeParse(rawData);

  if (!validatedFields.success) {
      const fieldErrors: Record<string, string[]> = {};
      validatedFields.error.issues.forEach((issue: z.ZodIssue) => {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });
      return { errors: fieldErrors, message: "Validation failed" };
  }

  try {
    const response = await fetch(`${API_URL}/educations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      return { message: `Failed to update education: ${response.statusText}` };
    }

    revalidatePath("/educations");
    return { message: "Education updated successfully", success: true };
  } catch {
    return { message: "Failed to update education" };
  }
}

export async function deleteEducation(id: string) {
  const session = await getSession();
  if (!session) {
    return { message: "Unauthorized" };
  }

  try {
    const response = await fetch(`${API_URL}/educations/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete education");
    }

    revalidatePath("/educations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting education:", error);
    return { success: false, message: "Failed to delete education" };
  }
}
