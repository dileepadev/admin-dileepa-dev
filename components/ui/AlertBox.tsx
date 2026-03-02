'use client';

import React from 'react';

export type AlertOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
};

export default function AlertBox({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: AlertOptions & { onConfirm: () => void; onCancel: () => void }) {
  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="alert-overlay absolute inset-0" onClick={onCancel} />
      <div className="alert-container relative w-full max-w-lg rounded-lg p-6 shadow-lg">
        {title && <h3 className="alert-title text-lg font-medium">{title}</h3>}
        {message && <p className="alert-message mt-2 text-sm">{message}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="alert-cancel hover:bg-bg-muted rounded-md border px-3 py-2 text-sm"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`rounded-md px-3 py-2 text-sm font-medium ${isDanger ? 'alert-confirm-danger' : 'alert-confirm'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
