'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { navigation } from './navigation';

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <header className="border-border bg-bg-primary/80 sticky top-0 z-50 flex h-14 items-center gap-4 border-b px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          className="text-text-primary hover:bg-bg-tertiary inline-flex h-10 w-10 items-center justify-center rounded-md lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <h1 className="text-text-primary text-lg font-semibold tracking-tight">Admin Panel</h1>
      </div>

      {/* Right side placeholder for future actions */}
      <div className="flex-1" />

      {/* Mobile backdrop (closes menu when clicking outside) */}
      {open && (
        <button
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}

      {/* Mobile Menu (collapsible) */}
      <div
        className={cn(
          'bg-bg-primary absolute top-full right-0 left-0 z-40 overflow-hidden border-b transition-all duration-300 lg:hidden',
          open ? 'max-h-[80vh] shadow-md' : 'max-h-0',
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'text-text-secondary hover:text-text-primary hover:bg-bg-secondary flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-medium transition-colors',
                pathname === item.href ? 'bg-accent/50 text-accent-foreground' : '',
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}

          <div className="border-border mt-2 flex flex-col gap-1 border-t pt-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-text-secondary hover:text-text-primary hover:bg-bg-secondary flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-medium transition-colors"
            >
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )
              ) : (
                <span className="h-4 w-4" />
              )}
              <span>
                {mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Toggle Theme'}
              </span>
            </button>
            <button
              onClick={() => {
                signOut();
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
