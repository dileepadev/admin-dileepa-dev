'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lockup } from '@/components/ui';
import packageJson from '@/package.json';
import { navigation } from './navigation';

/**
 * The admin's navigation, and the site's navbar behaviour.
 *
 * `dileepa-dev`'s nav is the reference this follows — AGENTS.md, "This app
 * follows dileepa-dev". Three things carry across and all three are in
 * `.side-nav` in `app/globals.css` rather than in utilities here:
 *
 * - **The accent is spent once.** The current item is `--brand`; nothing else
 *   in the list is. That is the same rule as the site's `[aria-current]`.
 * - **Weight never changes with state.** The active row on the site used to
 *   also change weight, which shifted the rows either side by a pixel as you
 *   scrolled. Only colour and surface move.
 * - **One transition, one duration.** `--dur` and `--ease`, the same pair the
 *   site's links, cards and theme toggle use.
 *
 * The classes live in CSS because that is where the site's do, and because
 * "the same interaction" is a thing that has to keep being true after the next
 * edit — a rule can hold that, a copied string of utilities cannot.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  // The dashboard is `/`, which prefixes everything. Matched exactly for that
  // reason; every other route matches itself or a child of itself.
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-full flex-col gap-6 p-5">
      <div className="px-3 py-1">
        <Lockup />
      </div>

      <nav aria-label="Sections" className="side-nav flex-1">
        {navigation.map((group) => (
          <div key={group.title} className="side-nav-group">
            <p className="side-nav-title">{group.title}</p>
            <ul>
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                    >
                      <item.icon aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-border-hairline border-t px-3 pt-4">
        <p className="text-fg-muted text-label font-mono" title={`Version ${packageJson.version}`}>
          v{packageJson.version}
        </p>
      </div>
    </div>
  );
}
