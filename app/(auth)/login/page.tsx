import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-foreground mt-10 text-center text-2xl leading-9 font-bold tracking-tight">
          Log in to your account
        </h2>
      </div>

      <div className="bg-card border-border mt-10 rounded-xl border p-8 shadow-sm sm:mx-auto sm:w-full sm:max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
