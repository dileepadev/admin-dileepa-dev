'use client';

import { Button } from '@/components/ui/buttons/Button';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login, LoginState } from '@/app/actions/auth';
import { Loader2 } from 'lucide-react';

const initialState: LoginState = {
  message: '',
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
      {pending ? 'Log in...' : 'Log in'}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="email" className="text-foreground block text-sm leading-6 font-medium">
          Email address
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="text-foreground bg-accent ring-border placeholder:text-muted-foreground focus:ring-ring block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
          />
          {state.errors?.email && (
            <p className="text-destructive mt-2 text-sm">{state.errors.email.join(', ')}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="text-foreground block text-sm leading-6 font-medium">
          Password
        </label>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="text-foreground bg-accent ring-border placeholder:text-muted-foreground focus:ring-ring block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
          />
          {state.errors?.password && (
            <p className="text-destructive mt-2 text-sm">{state.errors.password.join(', ')}</p>
          )}
        </div>
      </div>

      {state.message && (
        <div className="bg-destructive/15 rounded-md p-3">
          <div className="flex">
            <div className="text-destructive text-sm">{state.message}</div>
          </div>
        </div>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
