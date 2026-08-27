import { getSystemStatus } from '@/app/actions/maintenance';
import { apiHost } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ApiOfflineBanner, Container } from '@/components/ui';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const connection = await getSystemStatus();
  // Whether the admin itself is a dev server. Independent of which API it
  // talks to, which is the entire point of showing both.
  const local = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-dvh">
      {/* `--border-strong` rather than `--border`: this is the edge of a thing,
          the way the site's nav pill is, not one of the structural rules that
          separate rows inside a table. Design system §6. */}
      <aside className="border-border-strong bg-bg-surface sticky top-0 hidden h-dvh w-64 flex-none overflow-y-auto border-r lg:block">
        <Sidebar />
      </aside>

      <div className="min-w-0 flex-1">
        <Header connection={connection} apiHost={apiHost()} local={local} />
        <main>
          <Container>
            {/* Only a genuine transport failure. An API that answers but
                has no `/status` is `partial`, not this — every screen below
                reads from it fine, and claiming otherwise would contradict
                the data on the page. Raised here rather than per screen
                because every screen reads the same API. */}
            {connection.state === 'unreachable' && <ApiOfflineBanner apiHost={apiHost()} />}
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}
