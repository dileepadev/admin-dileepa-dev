import { ThemeToggle } from '@/components/ui';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6 py-12">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
