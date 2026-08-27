# AGENTS.md

Canonical instructions for AI coding agents working in this repository.

> This file is the **single source of truth**. `CLAUDE.md` and
> `.github/copilot-instructions.md` intentionally contain only tool-specific notes and point
> back here. Add shared rules **here only** — duplicating them causes drift and contradictory
> guidance.

## What this is

`admin-dileepa-dev` is the admin dashboard — the interface for managing every content type the
platform serves. It is a Next.js App Router app that talks to the API through server actions.

> [!IMPORTANT]
> **This app is not deployed.** It runs on localhost against whichever API `API_URL` names. That
> is why it keeps a **single `.env`** rather than the per-environment split `api-dileepa-dev` and
> `dileepa-dev` use: two files would always hold the same values. If it is ever deployed, split
> the configuration then, deliberately.

v2.0.0 rebrands the whole UI to the new design system, retargets every integration at the
migrated FastAPI backend, adds management for **projects**, and rebuilds **events** on the v2
model.

This app **follows** `dileepa-dev`. It does not invent its own components. Where the main site
has already solved something, match it.

Currently on branch `feat/v2.0.0`. Version `1.0.0`; the target is `2.0.0`.

[TODO.md](TODO.md) holds this repo's slice. Issue **#4** holds the full scope. The
cross-repository roadmap lives in `dileepadev/TODO.md`.

## Layout

| Path | Status |
| --- | --- |
| `app/(auth)/sign-in/` | **Built.** Sign-in page and form |
| `app/(dashboard)/` | **Built.** Ten content screens + the dashboard index |
| `app/(dashboard)/database/` | **Built.** Copy production into development, or empty it. Development-only: the API does not register these routes in production |
| `components/ui/EnvironmentStatus.tsx` | **Built.** The header badge — environment, API host, and database. Reads `GET /status`, which the API serves in every environment |
| `app/(dashboard)/account/` | **Built.** The signed-in account and its session. Claims are decoded server-side; the token never reaches the browser |
| `app/actions/` | **Built.** Four modules — `auth`, `profile`, `events`, `projects`, `blogs`, `upload`. Not one per resource: the CRUD is shared |
| `lib/api-schema.ts` | **Generated** from `openapi.json` by `npm run api:types`. Never edited by hand |
| `lib/types.ts` | **Built.** Names the generated shapes; the only file that reaches into `api-schema.ts` |
| `lib/api.ts` | **Built.** The typed FastAPI client — envelopes, error envelope, bearer token |
| `lib/crud.ts` | **Built.** One CRUD implementation, plus the FormData readers |
| `components/resource/` | **Built.** `fields.ts` describes a form, `ResourceForm` renders it, `ResourceManager` is the screen |
| `app/api/auth/sign-out/route.ts` | **Built.** Sign-out route handler |
| `proxy.ts` | **Built.** Cookie-gated route protection; matcher excludes `api` and `_next` |
| `lib/session.ts` | **Built.** Session cookie handling |
| `components/layout/` | **Built.** Header, Sidebar, grouped `navigation.ts` |
| `components/ui/` | **Built.** AlertBox, Badge, Button, Card, Container, Section, Field, DataTable, EmptyState, FormMessage, ImageField, RepeatableGroup, Lockup, ThemeToggle |
| `components/providers/` | **Built.** alert, theme, toast |
| `app/brand-tokens.css` | **Vendored** from `dileepadev/docs/brand/`. A copy — re-copy it when the canonical file changes; never patch it here |

Each content screen is two files:

- `page.tsx` — a server component that fetches and renders the screen.
- `<resource>-screen.tsx` — a client component holding the columns and the field schema.

**The split is not stylistic.** `columns[].cell` and `describe` are functions, and a function
cannot cross the server-to-client boundary. Putting them in `page.tsx` fails at runtime with
*"Functions cannot be passed directly to Client Components"*, which is not obvious from reading
either file.

## Toolchain

- Node + npm. `npm install`, then `npm run dev` — **port 3001**, not 3000.
- `npm run build` · `npm run start` · `npm run lint`
- Next.js App Router. Mutations go through **server actions** in `app/actions/`, not client
  fetches. Default to server components.
- Tailwind CSS 4 via `@tailwindcss/postcss`, configured in CSS.
- Zod for form validation. Prettier with `prettier-plugin-tailwindcss` — class order is
  enforced by the plugin, don't hand-sort.
- `.env.local` from `.env.example`.

Target versions for v2.0.0: Next.js **16.3.x**, React **19.2.x**, Tailwind **4.3.x**,
`@types/node` **^22** — matching `dileepa-dev` **exactly**. This app is currently on Next
16.1.4 while the main site is on 16.1.6; that drift is precisely what v2.0.0 exists to end.

## Coding standards

- Match the style already in the file you're editing.
- TypeScript throughout. No `any`.
- Server actions handle their own validation and return typed results. A form should never
  send an unvalidated body.
- Errors surface through `AlertBox` or the toast provider with the API's real message — never
  a swallowed failure and never a generic "something went wrong" when the API said more.
- Class merging goes through `clsx` + `tailwind-merge` (`lib/utils.ts`), not string concat.
- Comments explain *why*, not *what*.
- Repeatable field groups (speakers, photos, recordings, links) are one reusable pattern.
  Built once, in `components/ui/RepeatableGroup.tsx` — four of them land in the events form.

## Brand rules — v2.0.0

Tokens come from `dileepadev/docs/brand/brand-tokens.css`. Import them; never re-declare values.

> [!IMPORTANT]
> The HTML design reference still carries **v1.0 tokens** — `--cyan`, `--gold`, a different
> neutral ramp, Manrope aliased as the mono font, weights 600/800. Layout and structure only.
> Every colour and type value comes from `brand-tokens.css`.

- Emerald is the only accent. No second hue. Destructive actions use the functional error
  colour, never a new one.
- Never Emerald Deep on Carbon. Never Emerald Bright on Paper.
- Manrope (UI) and JetBrains Mono (IDs, slugs, dates, JSON previews) via `next/font`.
- Weights **400, 500, 700 only**. No 600.
- Sentence case across nav, buttons, form labels, table headers, and toasts.
- Emerald reserved for primary actions and the active nav state — one accent per surface. An
  admin screen is mostly tables and forms; resist tinting every row.
- No hard-coded hex in components.

The admin has more table, empty-state, loading, and error surfaces than the public site.
Define those patterns here and feed them back into `dileepadev/docs/design/design-system.md`.

## Testing

There is no test suite. Before calling a change done:

- `npm run lint` and `npm run build` both clean.
- Exercise the actual flow against a real API — create, edit, reorder, delete. A form that
  renders is not a form that saves.
- Check both themes and narrow widths.
- **Auth changes get tested on a preview deployment against a staging database first.** A
  broken session flow locks the owner out of their own admin.

## Docs

- `README.md` describes the screens as they are, comments moderation and reordering included.
  Keep it that way: it is the first thing anyone reads about this app.
- The demo video linked in `README.md` shows the v1.0 UI; re-record or re-caption it at release.
- `CHANGELOG.md` gets categorised entries at release time.

## Git workflow

- Branches: [BRANCH_NAMING_GUIDELINES.md](BRANCH_NAMING_GUIDELINES.md). `main` and `dev` are
  protected; never commit to them directly.
- Commits: [COMMIT_MESSAGE_GUIDELINES.md](COMMIT_MESSAGE_GUIDELINES.md) — if the work traces to
  a GitHub issue, reference it (`fixes #12`, `refs #12`); don't invent an issue number if none
  was given. v2.0.0 work traces to `refs #4`.
- PRs: [PULL_REQUEST_GUIDELINES.md](PULL_REQUEST_GUIDELINES.md)
- Versioning: [VERSIONING.md](VERSIONING.md) — SemVer.

## Secrets

- Real values live in `.env.local` (gitignored) — never in `.env.example`, never committed.
- Anything prefixed `NEXT_PUBLIC_` ships to the browser. The admin talks to the API with
  credentials; keep those server-side.
- Session cookies are auth material. Never log one, never widen its scope to make local
  development easier.

## Gotchas

- **Projects is built end to end** — API resource, this screen, and the site's routes. It was
  net-new across three repos in v2.0.0, so anything describing it as missing is stale.
- **`/events` keeps its path and changes shape.** An earlier draft of the migration renamed it to
  `sessions`; that is reverted. `status` is derived from `startAt` by the API and is not a form
  field — cancelling is the one status a person decides, and it has its own action.
- **A row index in a field name is a row identity, not a position.** `RepeatableGroup` keys rows
  so removing the second one does not re-label the third; `groups()` in `lib/crud.ts` reads by
  prefix and tolerates gaps. Counting rows instead is the bug where deleting a speaker moves the
  next one's data into its place.
- **Photographs appear in two places on the site** — the hero portrait and the event gallery, the
  latter composed from `events[].photos`. Attaching a photo to an event is how it gets there.
- **Blog fields are mostly written by the sync.** `POST /blogs/sync` rewrites title, description,
  dates, tags and reading time on every push to `blog-dileepa-dev`. Editing them here lasts until
  the next push, and the screen says so.
- **Blog management assumes a separate blog.** Rows carry absolute `blog.dileepa.dev` links and
  banner URLs pushed in by the sync script. Those fields stop making sense after consolidation.
- **Auth migration can lock you out.** FastAPI must validate the existing bcrypt hashes, and
  the JWT claim names, expiry, and cookie attributes must all line up. Changing the session
  cookie name signs everyone out — acceptable, but do it deliberately.
- **Dates from the API are strings.** Sorting and filtering do not work as expected until the
  FastAPI migration lands real datetimes.
- **Reordering is opt-in, and the numbering is inverted on purpose.** A screen gets drag-sorting
  by passing `reorder` to `ResourceManager`. The table shows positions 1..N with 1 at the top,
  while the API sorts `order` **descending** — so the top row is saved with the *highest* number.
  That inversion lives in `lib/crud.ts` and nowhere else; do not re-implement it per screen, and
  do not "fix" it in the API, where seven other collections share the convention.
- **The comments screen shows email addresses.** It is the only one that does. If you are adding
  a view that lists comments anywhere else, check which model you are reading: `PublicComment`
  has no field for an email and `Comment` does.
- **`proxy.ts`'s matcher excludes `api` and `_next`.** Adding a route that must be protected
  means checking that pattern, not assuming it is covered.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
