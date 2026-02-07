'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/actions/auth';
import { Button } from '@/components/ui/buttons/Button';
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  Calendar,
  Video,
  FileText,
  Users,
  Wrench,
  ImageUp,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'About', href: '/about', icon: User },
  { name: 'Experiences', href: '/experiences', icon: Briefcase },
  { name: 'Educations', href: '/educations', icon: GraduationCap },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Videos', href: '/videos', icon: Video },
  { name: 'Blogs', href: '/blogs', icon: FileText },
  { name: 'Communities', href: '/communities', icon: Users },
  { name: 'Tools', href: '/tools', icon: Wrench },
  { name: 'Media', href: '/media', icon: ImageUp },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn('bg-bg-elevated flex h-full w-64 flex-col border-r', className)}>
      <div className="border-border flex h-14 items-center border-b px-6">
        <span className="text-text-primary font-semibold tracking-tight">Admin Dashboard</span>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                href={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive
                    ? 'bg-accent/50 text-accent-foreground'
                    : 'text-text-secondary hover:text-text-primary',
                )}
                leftIcon={<item.icon className="h-4 w-4" />}
              >
                {item.name}
              </Button>
            );
          })}
        </nav>
      </div>
      <div className="border-border space-y-2 border-t p-4">
        <Button
          variant="ghost"
          className="text-text-secondary hover:text-text-primary w-full justify-start"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          leftIcon={
            mounted ? (
              theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <span className="h-4 w-4" />
            )
          }
        >
          {mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Toggle Theme'}
        </Button>
        <Button
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start"
          onClick={() => signOut()}
          leftIcon={<LogOut className="h-4 w-4" />}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
