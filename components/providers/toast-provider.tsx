'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
// small id generator to avoid adding a dependency
const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

type ToastType = 'default' | 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number; // ms, 0 for persistent
};

type ToastContextValue = {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => string;
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = genId();
    const toast: Toast = { id, ...t };
    setToasts((s) => [toast, ...s]);

    if (toast.duration && toast.duration > 0) {
      window.setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), toast.duration);
    }

    return id;
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((s) => s.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-60 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

/**
 * A toast is a surface, not a colour.
 *
 * Every toast shares one treatment; the border is the only thing that varies,
 * and only for an error. With a single accent colour there is no palette to
 * signal type with, and a success toast that says what succeeded does not need
 * a green box to prove it.
 */
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div
      role="status"
      className={`border-border-strong bg-bg-raised text-fg pointer-events-auto w-full max-w-sm rounded-lg border px-4 py-3 shadow-lg ${
        toast.type === 'error' ? 'border-error' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          {toast.title && <div className="text-fg text-small font-medium">{toast.title}</div>}
          {toast.description && (
            <div className="text-fg-muted text-small mt-1">{toast.description}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-fg-muted hover:text-fg text-small -mt-1 inline-flex cursor-pointer rounded p-1 transition-colors duration-[160ms]"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
