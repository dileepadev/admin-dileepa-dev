'use client';

import { ReactNode, useId } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className = '' }: TooltipProps) {
  const id = useId();

  return (
    <div className="relative inline-block">
      <div
        tabIndex={0}
        aria-describedby={id}
        className={`group inline-flex items-center ${className}`}
      >
        {children}
        <span
          id={id}
          role="tooltip"
          className="bg-bg-elevated border-border-light text-text-primary pointer-events-none absolute -top-20 left-1/2 z-50 w-max max-w-xs -translate-x-1/2 scale-95 transform rounded-md border px-3 py-4 text-sm opacity-0 shadow-lg transition-all duration-150 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus:scale-100 group-focus:opacity-100"
        >
          {content}
        </span>
      </div>
    </div>
  );
}
