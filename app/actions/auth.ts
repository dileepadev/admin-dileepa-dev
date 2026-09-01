'use server';

import { z } from 'zod';
import { createSession, deleteSession, broadcastSignOut } from '@/lib/session';
import { redirect } from 'next/navigation';
import { API_URL } from '@/lib/api';

const signInSchema = z.object({
  email: z.string().email({ message: 'That is not an email address.' }),
  password: z.string().min(1, { message: 'A password is required.' }),
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
  // `/auth/login` in v2.0.0 — v1's `/auth/sign-in` is not aliased. The body and
  // the token shape are unchanged, so a session minted by either still works.

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (!response.ok) {
      // The API's error envelope: { error: { code, message, details } }. Its
      // messages are written to be read by a person, so the message is shown
      // rather than replaced with a generic one.
      const payload = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;

      return {
        message:
          payload?.error?.message ??
          `Sign in failed with ${response.status} ${response.statusText}.`,
      };
    }

    const data = await response.json();

    if (!data.access_token) {
      return { message: 'The API answered without a token. Nothing was signed in.' };
    }
    await createSession(data.access_token);
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      message: 'Could not reach the API. Check that it is running and try again.',
    };
  }

  redirect('/');
}

export async function signOut() {
  await deleteSession();
  await broadcastSignOut();
  redirect('/sign-in');
}
