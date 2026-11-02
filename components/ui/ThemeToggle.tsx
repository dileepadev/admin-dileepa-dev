'use client';

import { useRef } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

/**
 * Radial spotlight theme transition, ported from `dileepa-dev`'s ThemeToggle so
 * the two surfaces change theme the same way: a circle of the target theme
 * grows from the centre of the button across the whole viewport, using the
 * View Transitions API.
 *
 * Without `startViewTransition`, or with reduced motion, the theme switches at
 * once. Both icons are always in the markup and CSS shows the right one, so the
 * server and the client render identical HTML.
 */
const REVEAL_MS = 2000;
const REVEAL_EASING = [0.16, 1, 0.3, 1] as const;

/**
 * The share of the reveal's duration at which the circle has grown to
 * `progress` of its final radius, under `REVEAL_EASING`. Solved on the curve
 * itself: the easing is monotonic, so a bisection on its parameter is exact
 * enough in twenty steps.
 */
function timeAtProgress(progress: number): number {
  const [x1, y1, x2, y2] = REVEAL_EASING;
  const bezier = (s: number, a: number, b: number) =>
    3 * (1 - s) ** 2 * s * a + 3 * (1 - s) * s ** 2 * b + s ** 3;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 20; i += 1) {
    const mid = (low + high) / 2;
    if (bezier(mid, y1, y2) < progress) low = mid;
    else high = mid;
  }
  return bezier((low + high) / 2, x1, x2);
}

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  function handleToggle() {
    const currentTheme =
      (typeof document !== 'undefined'
        ? document.documentElement.getAttribute('data-theme')
        : null) ||
      resolvedTheme ||
      'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Immediate fallback if View Transitions is unsupported or reduced motion is preferred
    if (
      typeof document === 'undefined' ||
      !('startViewTransition' in document) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      document.documentElement.setAttribute('data-theme', nextTheme);
      setTheme(nextTheme);
      return;
    }

    // Origin coordinates: Center of the clicked toggle button
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 0;

    // Radius required to reach the furthest corner of the viewport
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    // The page scrollbar is not in the transition's snapshot - it belongs to
    // the window, so it took the new theme the instant the attribute flipped,
    // two seconds ahead of everything around it. Hold its current colours and
    // let go when the circle reaches it, so it changes as the circle passes.
    const root = document.documentElement;
    const before = getComputedStyle(root);
    root.style.setProperty('scrollbar-color', before.scrollbarColor);
    root.style.setProperty('color-scheme', before.colorScheme);
    const releaseScrollbar = () => {
      root.style.removeProperty('scrollbar-color');
      root.style.removeProperty('color-scheme');
    };
    const scrollbarReach = Math.hypot(window.innerWidth - x, window.innerHeight / 2 - y);

    // Execute View Transition
    const transition = (
      document as unknown as {
        startViewTransition: (callback: () => void) => {
          ready: Promise<void>;
          finished: Promise<void>;
        };
      }
    ).startViewTransition(() => {
      document.documentElement.setAttribute('data-theme', nextTheme);
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: REVEAL_MS,
          easing: `cubic-bezier(${REVEAL_EASING.join(', ')})`,
          pseudoElement: '::view-transition-new(root)',
        } as KeyframeAnimationOptions,
      );
      window.setTimeout(
        releaseScrollbar,
        timeAtProgress(Math.min(1, scrollbarReach / endRadius)) * REVEAL_MS,
      );
    });
    // Whatever happens to the animation, never leave the colours pinned.
    transition.finished.finally(releaseScrollbar);
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleToggle}
      aria-label="Switch between light and dark theme"
      // The same hover every other bordered surface on the site takes: the
      // surface lifts one step and the border warms to the accent.
      className="border-border-strong text-fg-muted hover:bg-surface-hover hover:text-fg hover:border-brand ease-brand rounded-pill inline-flex h-10 w-10 items-center justify-center border transition-colors duration-[160ms]"
    >
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      <Moon className="block h-4 w-4 dark:hidden" aria-hidden="true" />
    </button>
  );
}
