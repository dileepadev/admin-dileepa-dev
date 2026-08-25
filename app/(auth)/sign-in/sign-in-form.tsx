'use client';

import { useActionState } from 'react';
import { signIn, type SignInState } from '@/app/actions/auth';
import { Button, Field, FormMessage, Input } from '@/components/ui';

const initialState: SignInState = {};

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="grid gap-4">
      <FormMessage message={state.message} />

      <Field name="email" label="Email" required errors={state.errors?.email}>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          invalid={Boolean(state.errors?.email?.length)}
        />
      </Field>

      <Field name="password" label="Password" required errors={state.errors?.password}>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          invalid={Boolean(state.errors?.password?.length)}
        />
      </Field>

      <div className="mt-2">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </div>
    </form>
  );
}
