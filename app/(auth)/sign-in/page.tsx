import type { Metadata } from 'next';
import { Card, Lockup } from '@/components/ui';
import { SignInForm } from './sign-in-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
  return (
    <div className="admin-section w-full max-w-md">
      <Lockup href="/" />
      <h1 className="text-fg text-h2 mt-6 font-medium">Sign in</h1>
      <p className="text-fg-body text-small mt-2">
        This app manages the content behind dileepa.dev. It runs locally and is never deployed.
      </p>

      <Card className="mt-8">
        <SignInForm />
      </Card>
    </div>
  );
}
