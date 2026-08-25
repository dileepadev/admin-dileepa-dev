import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Container } from '@/components/ui';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      {/* `--border-strong` rather than `--border`: this is the edge of a thing,
          the way the site's nav pill is, not one of the structural rules that
          separate rows inside a table. Design system §6. */}
      <aside className="border-border-strong bg-bg-surface sticky top-0 hidden h-dvh w-64 flex-none overflow-y-auto border-r lg:block">
        <Sidebar />
      </aside>

      <div className="min-w-0 flex-1">
        <Header />
        <main>
          <Container>{children}</Container>
        </main>
      </div>
    </div>
  );
}
