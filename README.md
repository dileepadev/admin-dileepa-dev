# admin-dileepa-dev

This is the administrative dashboard for managing content and data for my personal website and its associated API.

## Overview

This application serves as the admin interface for:

- [**dileepa-dev**](https://github.com/dileepadev/dileepa-dev): The personal website.
- [**api-dileepa-dev**](https://github.com/dileepadev/api-dileepa-dev): The API that provides personal data.

## UI Helpers: Toasts & Alert Boxes ✅

This repo now includes a global toast system and a programmatic alert dialog for consistent in-app notifications and confirmations.

- Toasts: Use the `useToast()` hook to push notifications anywhere in client components:

```tsx
const { push } = useToast();
push({ title: 'Saved', description: 'Saved successfully', type: 'success', duration: 4000 });
```

- Alert boxes (confirm/dialog): Use the `useAlert()` hook which returns a `show` function that resolves a boolean when the user confirms or cancels:

```tsx
const { show } = useAlert();
const ok = await show({ title: 'Delete', message: 'Delete this item?', variant: 'danger' });
if (ok) { /* proceed */ }
```

Both providers are automatically mounted at the application root (`ToastProvider` and `AlertProvider` are added in `app/layout.tsx`). A small demo is included on the dashboard page.

## Features

- Manage personal data exposed via the API.
- Content management for the personal website.
