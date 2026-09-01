# admin-dileepa-dev

This is the administrative dashboard for managing content and data for [dileepa.dev](https://dileepa.dev) and its associated API.

> [!IMPORTANT]
> **This app is not deployed.** It runs on localhost against whichever API `API_URL` names. That
> is why it has a single `.env` rather than the per-environment split the API and the main site
> use — two files would always hold the same values.

## Overview

This application serves as the central admin interface for:

- [**dileepa-dev**](https://github.com/dileepadev/dileepa-dev): The personal portfolio website.
- [**api-dileepa-dev**](https://github.com/dileepadev/api-dileepa-dev): The backend API providing data for the platform.

## Features

- **Dashboard** — counts what is *live* on the site rather than what exists in the database. A
  count of rows tells you the database is not empty; a count of what a visitor can see tells you
  whether the site is right, which is the question someone opening this app is asking.
- **Content management**, grouped the way the site is:
  - **Profile** — about, experiences, educations, tools, pillars, speaking topics
  - **Community** — communities, events, videos
  - **Content** — projects, blogs, comments, media
- **Events** carry speakers, photos, recordings and links as repeatable field groups. Photos
  attached here are the site's event gallery.
- **Blogs** are an index of what is in Git, not the posts themselves. The screen says so: the sync
  rewrites most of these fields on every push to `blog-dileepa-dev`. View and reaction counts are
  shown but not editable — readers write those, and the API refuses them on write.
- **Comments** — moderation, not authoring. Readers post from the website and their comments are
  live immediately, so this screen is what comes after: hiding one (reversible, and the replies
  underneath survive), correcting one, deleting one, or replying as the author. It is the only
  screen showing a commenter's email address; the public endpoint returns a model with no field
  for one.
- **Drag to reorder.** Any list can opt into it — tools, pillars and speaking topics do today. Rows carry a grip, their
  position number, and up/down arrows, because drag is a mouse gesture and the arrows are the
  whole keyboard and touch path. The order commits in one request, not one per row.
- **Media** — Cloudinary-backed uploads. This app never holds those credentials; every upload goes
  through the API, which is the only thing that does.
- **Videos** carry a short description shown under the title on the site. Optional — a video that
  predates the field simply has none.
- **Account** — who you are signed in as and for how long: email, roles, whether the account is
  active, and the session's expiry counted down live alongside when it was issued, how long it
  runs, and how it is signed. The account comes from the API and the session from your cookie, so
  where they disagree you can see it. The token is decoded on the server; only the claims reach
  the browser.
- **A status badge in the header**, on every screen — which environment, which API host, and
  which database this session is talking to. Reads `GET /status`, which the API registers in
  every environment specifically so this cannot be mistaken. Production gets `--warning`
  styling and an explicit warning line; an unreachable API says so in `--error` rather than
  the badge going quiet.
- **Database** — copy production into the development database, or empty it, so every screen here
  shows real content without production being touched. The copy only runs in one direction, and
  not because this app is careful: the API writes to the database it is pointed at and reads from
  a separately configured source, so there is no argument here that could be inverted. Both
  actions stay disabled until the target database's own name is typed out. `users` is never
  copied, so you stay signed in. **Development only** — the API does not register these routes
  when it runs in production, so pointing `API_URL` at `api.dileepa.dev` makes the screen say the
  feature is unavailable rather than offering buttons that would fail.
- **Authentication** — JWT in an `httpOnly` cookie, with the session watched client-side so an
  expired token signs out at the door rather than on the first save.
- **An unreachable API degrades rather than crashes.** Every list read falls back to empty and a
  banner names the API that is not answering, so a blank table is never mistaken for no data.
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
   call is made from, and it is the **only** thing that decides which database you are editing.
   How you start this app says nothing about it: `next dev` pointed at the deployed API is editing
   production, and looks exactly like `next dev` pointed at a local one.

   | `API_URL`                 | Talks to         | Database                                   |
   | ------------------------- | -------------    | ----------------------------------------   |
   | `http://localhost:8000`   | a local API      | whatever its own banner says, usually dev  |
   | `https://api.dileepa.dev` | the deployed API | **production** — saves are live            |

   The header badge reports which of those answered, and whether this admin is local, on every
   screen. Write it with no trailing slash and with `https` for anything that is not localhost; a
   trailing slash builds `//projects`, which the API 404s, and `http` puts the admin token on the
   wire in cleartext. Both are corrected at load with a warning — see `normalizeApiUrl` in
   [`lib/api.ts`](lib/api.ts) — but the file should be right.

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
