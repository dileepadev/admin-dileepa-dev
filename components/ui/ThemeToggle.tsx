'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Defer setState to avoid synchronous state update during render
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) {
    return (
      <button
        className="bg-secondary hover:bg-muted flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors"
        aria-label="Toggle theme"
        aria-pressed={false}
      >
        <Monitor className="h-5 w-5" />
      </button>
    );
  }

  const cycleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={cycleTheme}
      className="bg-secondary text-foreground hover:bg-muted flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-all hover:scale-105"
      aria-label={`Current theme: ${resolvedTheme}. Click to toggle.`}
      aria-pressed={resolvedTheme === 'dark'}
    >
      {resolvedTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
