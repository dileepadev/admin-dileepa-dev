'use client';

import { useEffect, useRef } from 'react';
import { Button } from './Button';

export interface AlertOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

/**
 * The confirmation dialog.
 *
 * A destructive confirmation names the thing being destroyed and what happens
 * — "Delete this event?" with the title in the message, not "Are you sure?".
 * The confirm button names the action.
 *
 * Focus moves to Cancel on open, deliberately: for a destructive dialog the
 * safe option should be the one a stray Enter lands on.
 */
export default function AlertBox({
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: AlertOptions & { onConfirm: () => void; onCancel: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
    >
      <div className="border-border-strong bg-bg-raised w-full max-w-md rounded-lg border p-6">
        <h2 id="alert-title" className="text-fg text-h3 font-medium">
          {title}
        </h2>
        {message && <p className="text-fg-muted text-small mt-3">{message}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button ref={cancelRef} type="button" variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
