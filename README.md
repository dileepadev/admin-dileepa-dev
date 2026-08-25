# admin-dileepa-dev

This is the administrative dashboard for managing content and data for [dileepa.dev](https://dileepa.dev) and its associated API.

> [!IMPORTANT]
> **This app is not deployed.** It runs on localhost against whichever API `API_URL` names. That
> is why it has a single `.env` rather than the per-environment split the API and the main site
> use — two files would always hold the same values.

## Demo Video

Click the link or image below to view the demo video on YouTube.

[![Admin Dashboard Demo](https://img.youtube.com/vi/nBv4h09KpyM/0.jpg)](https://www.youtube.com/watch?v=nBv4h09KpyM)

## Overview

This application serves as the central admin interface for:

- [**dileepa-dev**](https://github.com/dileepadev/dileepa-dev): The personal portfolio website.
- [**api-dileepa-dev**](https://github.com/dileepadev/api-dileepa-dev): The backend API providing data for the platform.

## Features

- **Dashboard** — counts what is *live* on the site rather than what exists in the database. A
  count of rows tells you the database is not empty; a count of what a visitor can see tells you
  whether the site is right, which is the question someone opening this app is asking.
- **Content management**, grouped the way the site is:
  - **Profile** — about, experiences, educations, tools
  - **Community** — communities, events, videos
  - **Content** — projects, blogs, media
- **Events** carry speakers, photos, recordings and links as repeatable field groups. Photos
  attached here are the site's event gallery.
- **Blogs** are an index of what is in Git, not the posts themselves. The screen says so: the sync
  rewrites most of these fields on every push to `blog-dileepa-dev`.
- **Media** — Cloudinary-backed uploads. This app never holds those credentials; every upload goes
  through the API, which is the only thing that does.
- **Authentication** — JWT in an `httpOnly` cookie, with the session watched client-side so an
  expired token signs out at the door rather than on the first save.
- **Themes** — dark and light, sharing the `dileepa-theme` storage key with every other surface,
  so the theme follows you between them.

## Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling:** [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Validation:** [Zod](https://zod.dev/)
- **Design system:** the platform token sheet, vendored to `app/brand-tokens.css` from
  [`dileepadev/docs/brand/`](https://github.com/dileepadev/dileepadev/tree/main/docs/brand).
  It is a **copy**, and a copy can drift — when the canonical file changes, re-copy it rather than
  patching this one. Every colour resolves through a semantic token; there is no hard-coded hex in
  any component.

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dileepadev/admin-dileepa-dev.git
   cd admin-dileepa-dev
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   One file, on purpose — see the note at the top. `API_URL` is read on the server, where every
   call is made from; point it at `http://localhost:8000` for a local API or at
   `https://api.dileepa.dev` for the real one. The API's own CORS allowlist decides whether it is
   allowed.

4. Start the API. This app is a client and does nothing useful without one:

   ```bash
   cd ../api-dileepa-dev && uv run fastapi dev
   ```

### Development

Run the development server:

```bash
npm run dev
```

The dashboard is at `http://localhost:3001`.

### Build

To create an optimized production build:

```bash
npm run build
npm run start
```

## Related Projects

- [dileepa-dev](https://github.com/dileepadev/dileepa-dev) - Personal Portfolio Website.
- [api-dileepa-dev](https://github.com/dileepadev/api-dileepa-dev) - Personal Data API.
- [blog-dileepa-dev](https://github.com/dileepadev/blog-dileepa-dev) - Personal Blog Content.
- [links-dileepa-dev](https://github.com/dileepadev/links-dileepa-dev) - Linktree-style page.

## Guidelines

Please refer to the following documents for contribution and development standards:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [BRANCH_NAMING_GUIDELINES.md](BRANCH_NAMING_GUIDELINES.md)
- [COMMIT_MESSAGE_GUIDELINES.md](COMMIT_MESSAGE_GUIDELINES.md)
- [PULL_REQUEST_GUIDELINES.md](PULL_REQUEST_GUIDELINES.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
