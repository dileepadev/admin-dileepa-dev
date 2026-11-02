import { LinkButton, Lockup } from '@/components/ui';

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-2xl place-items-center px-4 py-8">
      <section className="admin-section w-full text-center">
        <Lockup />
        <p className="text-fg-muted text-label mt-8 font-mono">404</p>
        <h1 className="text-h1 mt-3 font-medium">Page not found</h1>
        <p className="text-fg-body text-small mx-auto mt-4">
          This admin page does not exist. Open the dashboard to find the content screens.
        </p>
        <div className="mt-6">
          <LinkButton href="/">Back to dashboard</LinkButton>
        </div>
      </section>
    </main>
  );
}
