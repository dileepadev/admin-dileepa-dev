# Changelog

All notable changes to this project are documented in this file.

Changes are organized into the following categories:

- **Added:** New features or functionality introduced to the project.
- **Changed:** Modifications to existing functionality that do not add new features.
- **Fixed:** Bug fixes that resolve issues or correct unintended behavior.
- **Removed:** Features or components that have been removed from the project.

## [Unreleased]

Unreleased changes go here.

## [v2.0.0] - 2026-09-02

> [!NOTE]
> **This app is not deployed.** It runs on localhost against whichever API `API_URL` names, which
> is why it keeps a single `.env` rather than adopting the per-environment split the API and the main site use.
> The admin is retargeted at the FastAPI backend, rebuilt against the platform design system, and gains the two screens v2.0.0 needs.

### Added - v2.0.0

- **A Pillars screen** (`/pillars`) — the six cards under the About section on the homepage. They
  were a constant in the public site's `lib/constants.ts`, which made rewording one a pull request
  and a deploy. `icon` is a select rather than a text box: the API serves a closed set and the
  site resolves each name to an imported component, so a typo would render a card with no icon and
  nothing anywhere to say why. Reorderable, because the cards render three to a row and which
  three lead is a decision.
- **A Speaking topics screen** (`/speaking-topics`) — the sessions and talks on the speaker kit at
  `dileepa.dev/profile`, same reasoning and same shape. Reorderable, because the list follows
  whatever is actually being delivered that season.
- **The two speaker biographies on the About screen.** `shortBio` and `fullBio`, in a Speaker kit
  section of the form. The media kit copies each one verbatim behind its own copy button, so they
  are edited here rather than in the site's source — and they sit on the about record, beside the
  name and title the same page renders above them, so a bio cannot disagree with the person it is
  under.

- **The header badge reports whether the admin itself is local, alongside which API answered.**
  Neither implies the other, which is the whole point: `next dev` pointed at the deployed API is
  editing production while every other signal on the machine says "local" — the terminal shows
  `localhost:3101`, and the data looks real because it is. That combination gets named outright,
  with the one-line fix for it, rather than left to be inferred from a hostname. The same row
  appears in the Account screen's Connection card.

- **An Account screen** (`/account`) — who you are signed in as, and for how long. The account
  (email, roles, active, id, created) is read from `GET /auth/profile`, so it is current; the
  session (expiry counted down live, issued-at, length, token type, signing algorithm, subject,
  roles) is decoded from the token in the cookie, so it is a snapshot of sign-in. Both are shown
  because where they disagree the difference is the useful part — a role changed since sign-in
  says so, with a note that signing out picks it up. The cookie is `httpOnly` and stays that way:
  the token is decoded on the server and only the claims cross to the browser, never the token.
- **A status badge in the header**, on every screen: which environment, which API host, and
  which database this session is actually talking to. It exists because the Database screen's own
  copy can make the two databases converge — after a copy, development and production can hold
  identical content, and the one thing that still tells them apart is which connection this
  session uses, which needed to be visible everywhere, not only on the one screen that changes it.
  Collapsed to environment and host by default, expanding via `<details>` to the database label,
  whether docs are enabled, and whether the Database screen is available on this deployment.
  Production gets `--warning` styling and an explicit sentence — "This session writes to
  production" — because that is a state worth noticing, not a decorative one. When the API cannot
  be reached at all, the badge says so in `--error` rather than staying quiet, since silence here
  would read as "everything is fine" on the one screen most likely to be asked while something is
  not.
- **A Database screen** (`/database`), for working against production data without touching it.
  It shows both databases with their credentials stripped, a per-collection count on each side,
  and two actions: replace this database with a copy of production, or empty it. Neither exists
  on the production API — the routes are not registered there — so pointing `API_URL` at
  production makes the screen say so rather than offering buttons that would fail.

  The screen sends a confirmation string and nothing else. It cannot name a source, a target or
  a direction, so there is no argument here that could be the wrong way round. Both buttons stay
  disabled until the target database's own name is typed out, which is the friction
  `scripts/_common.py` imposes on a production write and for the same reason: a yes/no dialog is
  answered by reflex. `users` is never copied, so signing in still works afterwards.
- **A typed client generated from the API's published OpenAPI spec.** `openapi.json` is vendored,
  `npm run api:types` writes `lib/api-schema.ts`, and `lib/types.ts` is now named aliases onto it
  rather than 307 hand-written lines — the same two-file split `dileepa-dev` uses. Generating them
  immediately surfaced drift the hand-written copies had accumulated: `Comment` declared an `order`
  the API does not return, `EventRecord` was missing `series` entirely, and `UploadRecord` had
  neither `mimetype` nor its timestamps.
- **Security headers on every response**, set in `next.config.ts`: a Content-Security-Policy,
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and
  `Strict-Transport-Security`. The app previously sent none. The policy is tight because this app
  loads no third-party script and embeds no frame — `img-src` names Cloudinary and nothing else,
  and the API is reached from server actions rather than the browser, so `connect-src` stays
  `'self'`.

  **The policy differs in development, and only there.** React's development build calls `eval()`,
  hot module replacement is a WebSocket, and Turbopack serves some chunks from `blob:` URLs, so
  `'unsafe-eval'`, `blob:` and `ws:`/`wss:` are added when `NODE_ENV` is `development` and never
  otherwise. Verified both ways in a browser: the sign-in screen and the dashboard report a clean
  console under `next dev`, and the production header carries none of the three.
- `typecheck`, `format` and `format:check` scripts, so the checks the release notes claim were run
  are runnable by name rather than from memory.

- **Comments** — a moderation screen. Readers post from the website and their comments are live
  immediately, so this is what comes after: hide (reversible, and the replies underneath survive),
  edit, delete, or reply as the author. It is the only screen showing a commenter's email address;
  the public endpoint returns a model with no field for one.
- **Drag to reorder**, opt-in per screen through `ResourceManager`'s `reorder` prop and used by
  tools. Every row carries a grip, its position number, and up/down arrows — the arrows are not a
  nicety, since native HTML5 drag does not work on touch and is not keyboard-reachable at all.
  The commit is one request, not one PATCH per row, and it is optimistic: the row moves under the
  cursor, and a failed save snaps back rather than leaving a wrong order on screen.
  Positions read 1..N with 1 at the top while the API keeps sorting `order` descending; that
  inversion lives in `lib/crud.ts` alone.
- `description` on the video form, and in the videos table. Optional — a video that predates the
  field simply has none.
- View and reaction counts on the blog list, read-only. Readers write those, and the API refuses
  them on create, update and sync alike.
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
- **The design reference travels with the repository.** `DESIGN.md` and `docs/` — the brand guide,
  the design system, the canonical token sheet, and the full `docs/brand/` icon and cover set —
  are copied in from the platform root, so the contract this app is built against can be read
  without cloning another repository. They are copies rather than a fork: `.prettierignore` covers
  them for the same reason it already covered the vendored token sheet, since formatting a copy
  rewrites lines the source did not and every later re-copy then shows a diff that means nothing.

### Changed - v2.0.0

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
- **The typed client is now verified against the deployed API rather than against the spec alone.**
  `api.dileepa.dev` serves v2.0.0, so every model this app sends or receives was diffed
  field-for-field against live payloads: `Project` at 23 fields, `Event` at 29, `Pillar` at 9 and
  `SpeakingTopic` at 8 all match the vendored `openapi.json` exactly. All eight collections answer
  `200` with the `{ items, total, limit, offset }` envelope and real data, which is also the
  200-on-empty contract this branch was rewritten for, confirmed against the thing itself.

### Fixed - v2.0.0

- **The dashboard claimed the API was not answering while reading from it successfully.**
  `getSystemStatus` mapped every failure to `null`, and the layout rendered `null` as "not
  answering". But `GET /status` is newer than the deployed API and 404s there, so pointing
  `API_URL` at `api.dileepa.dev` produced a standing banner — *"api.dileepa.dev is not answering …
  check that the API is running"* — on top of screens that were loading production data perfectly
  well. The advice was wrong in both directions: the API was running, and `API_URL` was right.

  The three outcomes are now distinct (`Connection` in `lib/types.ts`). A 404 on `/status` falls
  back to the public `/version`, which has been deployed since v2.0.0 and carries the environment
  and version — so the badge still reports `production`, marks the database and maintenance rows
  `Unknown`, and says why in a muted note rather than an alarm. Only a genuine transport failure
  raises the offline banner now.

- **`API_URL` with a trailing slash silently 404'd every request.** Every endpoint path already
  begins with `/`, so `https://api.dileepa.dev/` built `https://api.dileepa.dev//projects`, which
  the API does not collapse — it 404s. The admin then rendered as though every collection were
  empty, on every screen, with no error anywhere, because one 404 per resource is
  indistinguishable from having no data. `normalizeApiUrl` in `lib/api.ts` strips the slash at
  load.

- **`API_URL` over `http://` put the admin bearer token on the wire in cleartext.** The token
  travels in a request header, and the deployed API's 301 to HTTPS does not help: the first
  request has already left the machine carrying it. Remote hosts are now upgraded to `https://`
  before any request is made; `localhost` and friends are left alone, where plaintext is correct.

  Both are corrected with a warning rather than thrown on. Throwing at module load takes the whole
  admin down over a one-character typo in a dotenv file, and neither safe value is in doubt —
  nobody means "send my admin token in the clear". The warning names the file to fix.

- **An unreachable API took down every screen instead of one.** Each `getX()` in `app/actions/`
  was a bare `(await resource(path).list()).items`, so a connection failure threw out of the
  server component and 500'd the whole route — worst on the dashboard index, which reads nine
  collections and therefore failed if any one of them did. They now go through `readList` in
  `lib/crud.ts`, which degrades to an empty list.

  Degrading is only honest if the failure is stated, so it comes with a banner in the dashboard
  layout naming the API that is not answering. Otherwise "the API is down" renders as "you have
  no projects", under an empty state helpfully explaining how to publish one.

  `readList` **rethrows** Next's `DYNAMIC_SERVER_USAGE` bailout rather than swallowing it, and
  `isStaticBailout` in `lib/api.ts` is now shared for that purpose. That signal is how Next
  learns a route is dynamic; catching it in a `catch` meant for network errors would have left
  every screen looking static and prerendered at build time with no data at all — trading a
  visible failure for a silent one. `api-links.ts`, `upload.ts` and `maintenance.ts` had the same
  hole and are fixed the same way.
- **`ApiEndpoints.tsx` read `.length` off two optional fields.** `ApiLink.endpoints` and
  `Endpoint.parameters` both default to an empty list server-side and are therefore optional in
  the spec, so a catalogue entry arriving without either crashed the panel. Found by generating
  the types rather than writing them.
- **`GET /api/auth/sign-out` is gone; the route is `POST` only.** A `GET` that clears the session
  cookie can be triggered by any cross-site top-level navigation, and `sameSite: 'lax'` sends the
  session cookie on exactly those — so a plain link on someone else's page was enough to sign the
  admin out. A cross-site `POST` is not a top-level navigation, so Lax withholds the cookie and
  the request cannot be forged. `SessionWatcher` was the only caller and has always used `POST`.
- **Four high-severity dependency advisories closed** by moving to Next 16.3.2: 16.1.4 pulled
  `sharp@0.34.5`, which inherits four libvips CVEs, and a `postcss` carrying two path-traversal
  advisories that disclose arbitrary `.map` files. `npm audit` reports zero, production and
  development alike.
- **The vendored token sheet had drifted from canonical.** It was missing the scoped `.chip:hover`
  rule — the fix the design system calls out by name, where an unscoped `.chip:hover` reaches every
  chip on a page regardless of what the component does, because a `cursor: default` utility cancels
  the cursor and nothing else. Re-copied whole from the canonical v2.1 sheet, keeping only the two
  changes the design system sanctions for a Next.js app: the vendor header, and the dropped Google
  Fonts `@import` that `next/font` replaces. The result is byte-identical to canonical apart from
  exactly those two, which is the property that makes the next re-copy a clean one.
- **Three committed files failed `format:check`.** `app/globals.css`, `components/ui/Badge.tsx` and
  `components/ui/Lockup.tsx` had drifted after the script was added, so the check the release notes
  claimed was clean was not. All three changes are cosmetic — Tailwind class order, a joined
  attribute list, a wrapped selector — and none alters a rendered style.

### Removed - v2.0.0

- **Two `next/image` hosts that nothing serves.** `dileepadev.blob.core.windows.net` was the Azure
  Blob backend the API retired in v2.0.0, and `youtube.com` never served an image to `next/image`
  at all — recordings are linked, not embedded. Each was a host the image optimiser would fetch
  arbitrary paths from on request. Cloudinary only now, matching the main site.
- **`X-Powered-By: Next.js`** — named the framework on every response, and nothing read it.
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
[v2.0.0]: https://github.com/dileepadev/admin-dileepa-dev/releases/tag/v2.0.0
[v1.0.0]: https://github.com/dileepadev/admin-dileepa-dev/releases/tag/v1.0.0
