"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, LoginState } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";

const initialState: LoginState = {
  message: "",
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
    >
      {pending ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-foreground"
        >
          Email address
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-md border-0 py-1.5 text-foreground bg-accent shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6 px-3"
          />
          {state.errors?.email && (
            <p className="mt-2 text-sm text-destructive">
              {state.errors.email.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium leading-6 text-foreground"
        >
          Password
        </label>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="block w-full rounded-md border-0 py-1.5 text-foreground bg-accent shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6 px-3"
          />
          {state.errors?.password && (
            <p className="mt-2 text-sm text-destructive">
              {state.errors.password.join(", ")}
            </p>
          )}
        </div>
      </div>

      {state.message && (
        <div className="rounded-md bg-destructive/15 p-3">
          <div className="flex">
            <div className="text-sm text-destructive">{state.message}</div>
          </div>
        </div>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
