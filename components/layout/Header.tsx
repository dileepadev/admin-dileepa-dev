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
      <header className="border-border-hairline bg-bg/85 sticky top-0 z-30 border-b-[0.5px] backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-6">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="admin-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="border-border-hairline text-fg-muted hover:text-fg inline-flex h-9 w-9 items-center justify-center rounded border-[0.5px] lg:hidden"
          >
            {open ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <p className="text-fg-muted text-small font-mono">
            Content for{' '}
            <a
              href="https://dileepa.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand"
            >
              dileepa.dev
            </a>
          </p>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut}>
              <Button type="submit" variant="secondary" size="compact">
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {open && (
        <div
          id="admin-nav"
          className="border-border-hairline bg-bg-surface border-b-[0.5px] lg:hidden"
        >
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
