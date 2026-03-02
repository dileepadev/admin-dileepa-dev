'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import AlertBox, { AlertOptions } from '@/components/ui/AlertBox';

type AlertContextValue = {
  show: (opts: AlertOptions) => Promise<boolean>;
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<AlertOptions>({});
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const show = useCallback((options: AlertOptions) => {
    setOpts(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const onConfirm = useCallback(() => {
    setOpen(false);
    resolverRef.current?.(true);
  }, []);

  const onCancel = useCallback(() => {
    setOpen(false);
    resolverRef.current?.(false);
  }, []);

  return (
    <AlertContext.Provider value={{ show }}>
      {children}
      {open && (
        <AlertBox
          title={opts.title}
          message={opts.message}
          confirmText={opts.confirmText}
          cancelText={opts.cancelText}
          variant={opts.variant}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
}
