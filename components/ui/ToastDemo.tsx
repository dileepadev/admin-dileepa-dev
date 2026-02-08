'use client';

import React from 'react';
import { useToast } from '@/components/providers/toast-provider';
import { useAlert } from '@/components/providers/alert-provider';

export default function ToastDemo() {
  const { push } = useToast();
  const { show } = useAlert();

  const handleSimple = () => {
    push({ title: 'Saved', description: 'Your item was saved.', type: 'success', duration: 4000 });
  };

  const handleError = () => {
    push({ title: 'Error', description: 'Something went wrong.', type: 'error', duration: 5000 });
  };

  const handleConfirm = async () => {
    const ok = await show({
      title: 'Delete item',
      message: 'Are you sure you want to delete this item?',
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
    if (ok)
      push({ title: 'Deleted', description: 'Item deleted.', type: 'success', duration: 3000 });
    else
      push({ title: 'Cancelled', description: 'No changes made.', type: 'info', duration: 2500 });
  };

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={handleSimple}
        className="alert-confirm rounded-md px-4 py-2 text-sm font-medium"
      >
        Show success toast
      </button>

      <button
        onClick={handleError}
        className="alert-confirm-danger rounded-md px-4 py-2 text-sm font-medium"
      >
        Show error toast
      </button>

      <button onClick={handleConfirm} className="alert-cancel rounded-md border px-4 py-2 text-sm">
        Show confirm alert
      </button>
    </div>
  );
}
