'use server';

import { z } from 'zod';
import { createSession, deleteSession, broadcastSignOut } from '@/lib/session';
import { redirect } from 'next/navigation';

const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type SignInState = {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
};

export async function signIn(prevState: SignInState, formData: FormData): Promise<SignInState> {
  const validatedFields = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  const API_URL = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${API_URL}/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (!response.ok) {
      // Try to extract a useful message from the server response body
      let serverMessage = '';
      try {
        const bodyText = await response.text();
        try {
          const bodyJson = JSON.parse(bodyText);
          serverMessage = bodyJson?.message ?? bodyText ?? '';
        } catch {
          serverMessage = bodyText || '';
        }
      } catch {
        serverMessage = '';
      }

      // Build a helpful message that includes status when possible
      const defaultMessage = serverMessage
        ? `Sign in failed: ${response.status} ${response.statusText} — ${serverMessage}`
        : `Sign in failed: ${response.status} ${response.statusText}`;

      if (response.status === 401) {
        return {
          message: serverMessage || 'Invalid credentials.',
        };
      }

      return {
        message: defaultMessage,
      };
    }

    const data = await response.json();

    if (data.access_token) {
      await createSession(data.access_token);
    } else {
      return { message: 'Sign in failed: No token received.' };
    }
  } catch (error) {
    console.error('Sign in error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return {
      message: `Network error: ${errMsg}`,
    };
  }

  redirect('/');
}

export async function signOut() {
  await deleteSession();
  await broadcastSignOut();
  redirect('/sign-in');
}
