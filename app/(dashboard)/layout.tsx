import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Container } from '@/components/ui';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="border-border-hairline bg-bg-surface sticky top-0 hidden h-dvh w-64 flex-none overflow-y-auto border-r-[0.5px] lg:block">
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
