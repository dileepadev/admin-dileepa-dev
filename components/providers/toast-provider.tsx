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

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  // simple entrance animation using Tailwind
  const bgClass =
    toast.type === 'success'
      ? 'toast-success'
      : toast.type === 'error'
        ? 'toast-error'
        : toast.type === 'info'
          ? 'toast-info'
          : 'toast-default';

  return (
    <div
      role="status"
      className={`${bgClass} pointer-events-auto w-full max-w-sm transform rounded-md border px-4 py-3 shadow-lg transition duration-200 ease-out`}
    >
      <div className="flex items-start">
        <div className="flex-1">
          {toast.title && <div className="text-text-primary font-medium">{toast.title}</div>}
          {toast.description && (
            <div className="text-text-muted mt-1 text-sm">{toast.description}</div>
          )}
        </div>
        <div className="ml-4 shrink-0 self-start">
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary inline-flex rounded-md bg-transparent p-1 text-sm"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
