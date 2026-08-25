'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

/**
 * No mounted flag and no effect.
 *
 * Both icons are always in the markup and CSS shows the right one, so the
 * server and the client render identical HTML and there is nothing to
 * reconcile. `resolvedTheme` is only read inside the click handler, by which
 * point the component is hydrated and the value is correct.
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Switch between light and dark theme"
      className="border-border-hairline text-fg-muted hover:bg-bg-raised hover:text-fg inline-flex h-9 w-9 items-center justify-center rounded border-[0.5px] transition-colors duration-[160ms]"
    >
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      <Moon className="block h-4 w-4 dark:hidden" aria-hidden="true" />
    </button>
  );
}
