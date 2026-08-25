'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lockup } from '@/components/ui';
import { navigation } from './navigation';
import { cn } from '@/lib/utils';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  // The dashboard is `/`, which prefixes everything. Matched exactly for that
  // reason; every other route matches itself or a child of itself.
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-full flex-col gap-8 p-6">
      <Lockup />

      <nav aria-label="Sections" className="flex flex-1 flex-col gap-6">
        {navigation.map((group) => (
          <div key={group.title}>
            <p className="text-fg-muted mb-2 font-mono text-xs tracking-[0.16em] uppercase">
              {group.title}
            </p>
            <ul>
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'text-small flex items-center gap-3 rounded px-3 py-2 no-underline',
                        'transition-colors duration-[160ms]',
                        active ? 'bg-bg-raised text-fg font-medium' : 'text-fg-muted hover:text-fg',
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-none" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
