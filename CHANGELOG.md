# Changelog

All notable changes to this project are documented in this file.

Changes are organized into the following categories:

- **Added:** New features or functionality introduced to the project.
- **Changed:** Modifications to existing functionality that do not add new features.
- **Fixed:** Bug fixes that resolve issues or correct unintended behavior.
- **Removed:** Features or components that have been removed from the project.

## [Unreleased]

### 2.0.0 — in progress on `feat/v2.0.0`

The admin is retargeted at the FastAPI backend, rebuilt against the platform design system, and
gains the two screens v2.0.0 needs.

> [!NOTE]
> **This app is not deployed.** It runs on localhost against whichever API `API_URL` names, which
> is why it keeps a single `.env` rather than adopting the per-environment split the API and the
> main site use.

#### Added - 2.0.0

- **Projects** — a management screen for the resource the API gained in v2.0.0. Net-new; there
  was nothing to port.
- **Events**, rebuilt on the v2 model: speakers, photos, recordings and links as repeatable field
  groups, structured timezone-aware start and end times, a slug, tags, a host, slides and a cover.
  Photos attached here are the site's event gallery.
- **A repeatable field group, built once.** Six screens needed one, and six hand-rolled versions
  would be six sets of index bugs. **The index in a field name is a row identity, not a
  position**: rows keep a key that never changes, so removing the second row does not silently
  re-label the third and move its data into its place.
- **A schema-driven form renderer.** A screen describes its fields as data; one renderer draws
  them, with the label, the control, the hint and the error in a single component — so a field
  cannot ship without its error slot, which is how a form ends up rejecting input and saying
  nothing.
- Table, empty-state, confirmation and toast patterns, documented back into
  `dileepadev/docs/design/design-system.md` §6.
- A `--dry-run`-style safety on destructive actions: a confirmation names what is being deleted
  and what happens to it, and focus opens on Cancel so a stray Enter lands on the safe option.

#### Changed - 2.0.0

- **The whole surface is rebuilt on the platform token sheet.** Manrope and JetBrains Mono via
  `next/font` at weights 400, 500 and 700 only; the deep-blue-and-silver palette and Geist are
  gone. Every colour resolves through a semantic token, and `next-themes` writes `data-theme`
  under the shared `dileepa-theme` key so the theme follows a visitor between surfaces.
- **Ten near-identical action files become one CRUD implementation.** They were about 2,300 lines
  of the same fetch, the same Zod flattening, the same try/catch and the same `revalidatePath`.
  Ten copies of a thing is ten places a fix has to land, and in practice it lands in one or two.
- **Every call goes through a typed client** that understands the v2 envelopes: `{ items, total,
  limit, offset }` on collections, `{ error: { code, message, details } }` on failures. The API
  writes its error messages to be read by a person, so they are shown rather than replaced with
  "Something went wrong".
- **An empty collection is a `200`.** Every v1 action carried a `if (status === 404) return []`
  branch, which also swallowed genuinely missing records.
- Sign-in posts to `/auth/login` rather than `/auth/sign-in`, and uploads to `/uploads` rather
  than `/upload`. Same bodies, same token shape.
- Navigation is grouped — Overview, Profile, Community, Content — because a flat list of ten items
  made a person read all ten to find one.
- Blog fields the sync owns are marked as such on the screen. Almost everything there is rewritten
  by `POST /blogs/sync` on every push to `blog-dileepa-dev`, so editing it here lasts until the
  next push. Saying so once, plainly, is cheaper than everyone learning it the hard way.

#### Removed - 2.0.0

- **The blog banner fields.** Posts carry no image of their own; anything a post shows is an
  ordinary Markdown image in the body pointing at a URL.
- **Video thumbnails from the list view.** The field is still stored and editable — dropping data
  to change a layout is not a trade worth making — but the site no longer renders it.
- `components/ui/ToastDemo.tsx`, and the v1 `bg-badge-*` / `toast-*` / `alert-*` utility classes
  they depended on.

## [v1.0.0] - 2026-03-02

### Added - v1.0.0

- Initial project setup using Next.js, TypeScript, ESLint, and Prettier.
- Core layout components and responsive design for all devices.
- Administrative sections for managing Content:
  - About profile information.
  - Professional work experiences and roles.
  - Academic background (Educations).
  - Events, talks, and appearances.
  - Video content links (Talks and tutorials).
  - Blog post metadata and summaries.
  - Tech communities involvement.
  - Tools, frameworks, and technologies used.
- Authentication system with login, logout, session management, and auto sign-out on expiry.
- Form validations, custom toasts, and alert boxes for better user experience.
- Image preview functionality for all uploaded assets.
- Brand-consistent theme application.
- Performance, accessibility, and loading speed optimizations.

<!-- e.g., -->
<!-- Unreleased -->
<!-- v2.0.0 -->
<!-- v1.1.0 -->
<!-- v1.0.0 -->
<!-- v0.0.1 -->

[Unreleased]: https://github.com/dileepadev/admin-dileepa-dev/branches
[v1.0.0]: https://github.com/dileepadev/admin-dileepa-dev/releases/tag/v1.0.0
