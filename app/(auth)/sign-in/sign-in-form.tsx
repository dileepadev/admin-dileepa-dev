'use client';

import { useActionState } from 'react';
import { signIn, type SignInState } from '@/app/actions/auth';
import { Button, Field, FormMessage, Input, PasswordInput, ValidatedForm } from '@/components/ui';

const initialState: SignInState = {};

/** The sign-in form's validation copy - see `useFormErrors`. */
const FIELD_MESSAGES = {
  email: {
    missing: 'Enter your email address.',
    invalid: 'Enter an email address like you@example.com.',
  },
  password: { missing: 'Enter your password.' },
};

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <ValidatedForm action={action} className="grid gap-4" messages={FIELD_MESSAGES}>
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
        <PasswordInput
          name="password"
          autoComplete="current-password"
          required
          invalid={Boolean(state.errors?.password?.length)}
        />
      </Field>

      <div className="mt-2">
        <Button type="submit" busy={pending} className="w-full">
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </div>
    </ValidatedForm>
  );
}
