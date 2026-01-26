"use server";

import { z } from "zod";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  const API_URL = process.env.API_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!response.ok) {
        if (response.status === 401) {
            return {
                message: "Invalid credentials.",
            };
        }
      return {
        message: "An error occurred during login. Please try again.",
      };
    }

    const data = await response.json();
    
    if (data.access_token) {
        await createSession(data.access_token);
    } else {
        return { message: "Login failed: No token received." };
    }

  } catch (error) {
    console.error("Login error:", error);
    return {
      message: "Network error. Please make sure the API is running.",
    };
  }
  
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
