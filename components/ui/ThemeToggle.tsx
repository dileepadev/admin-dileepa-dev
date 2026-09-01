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
      // The same hover every other bordered surface on the site takes: the
      // surface lifts one step and the border warms to the accent. It used to
      // swap its border for `--bg-raised`, which in the light theme is #fff —
      // so the hover was invisible on a white header.
      className="border-border-strong text-fg-muted hover:bg-surface-hover hover:text-fg hover:border-brand ease-brand inline-flex h-10 w-10 items-center justify-center rounded border transition-colors duration-[160ms]"
    >
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      <Moon className="block h-4 w-4 dark:hidden" aria-hidden="true" />
    </button>
  );
}
