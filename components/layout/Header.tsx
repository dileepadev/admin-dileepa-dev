'use client';

import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { Button, ThemeToggle } from '@/components/ui';
import { Sidebar } from './Sidebar';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="border-border-hairline bg-bg/85 sticky top-0 z-30 border-b backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="admin-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="border-border-strong text-fg-muted hover:bg-surface-hover hover:text-fg hover:border-brand ease-brand inline-flex h-9 w-9 items-center justify-center rounded border transition-colors duration-160 lg:hidden"
            >
              {open ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <p className="text-fg-muted text-small truncate font-mono">
              Content for{' '}
              <a
                href="https://dileepa.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                dileepa.dev
              </a>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut}>
              <Button type="submit" variant="secondary" size="compact" aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {open && (
        <div
          id="admin-nav"
          className="border-border-hairline bg-bg-surface max-h-[calc(100dvh-4rem)] overflow-y-auto border-b lg:hidden"
        >
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
