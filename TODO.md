# TODO

This file tracks tasks, improvements, and features planned for upcoming updates or releases of
this repository.

> [!NOTE]
> This is this repository's slice of the v2.0.0 migration. The cross-repository roadmap lives in
> [`dileepadev/TODO.md`](https://github.com/dileepadev/dileepadev/blob/main/TODO.md), and the full
> scope for this repo is in
> [issue #4](https://github.com/dileepadev/admin-dileepa-dev/issues/4).

## v2.0.0 — new design system, FastAPI, two new content types

The admin rebrands to the v2.0.0 design system, retargets every integration at the migrated FastAPI
backend, and gains management for projects and a rebuilt events screen. Architecture and rules are in
[AGENTS.md](AGENTS.md).

**This app follows `dileepa-dev`.** It does not invent its own components. Where the main site has
already solved something, match it — that is why this phase comes after the main site's rebuild.

### Foundation

- [x] Next.js 16.1.4 → **16.3.2**, React → **19.2.8**, Tailwind CSS → **4.3.3**, `@types/node` → **^22.20.1**.
      This was also the security fix: 16.1.4 pulled `sharp@0.34.5` (four libvips CVEs, high) and a
      `postcss` with two path-traversal advisories. `npm audit` went from 4 high to 0
- [x] Versions match `dileepa-dev` **exactly** — both are now Next 16.3.2, React 19.2.8,
      Tailwind 4.3.3. The drift v2.0.0 exists to end is closed
- [x] Vendor `brand-tokens.css` from `dileepadev/docs/brand/`, recording the source
- [x] Manrope (UI) + JetBrains Mono (IDs, slugs, dates, JSON previews) via `next/font`, weights 400/500/700
- [x] **Single `.env`, documented as deliberate** — this app is not deployed, so the
      per-environment split the API and the main site use would be two files holding the same
      values

### Rebrand

- [x] Rebuild `components/ui/` against `dileepadev/docs/design/design-system.md`
- [x] Sentence case across nav, buttons, form labels, table headers, and toasts
- [x] Emerald for primary actions and the active nav state only. An admin screen is mostly tables and
      forms — resist tinting every row
- [x] Destructive actions use the functional error colour, never a new hue
- [x] No hard-coded hex in components
- [ ] Both themes verified on every screen
- [x] Define the table, field, repeatable-group, empty-state, confirmation and toast patterns
      here, and **feed them back into** `dileepadev/docs/design/design-system.md` §6

### API integration

- [x] Retarget every server action at FastAPI
- [x] **Collapse ten near-identical action files into one CRUD implementation** — about 2,300
      lines of the same fetch, Zod flattening and try/catch. Ten copies of a thing is ten places a
      fix has to land
- [ ] Generate a typed client from the published OpenAPI spec, as `dileepa-dev` does. The shapes
      are hand-written in `lib/types.ts` until then
- [x] Adopt the new list and error envelopes; surface the API's real message, never a generic failure
- [x] Stop treating a `404` on a collection as "empty" — v2 answers an empty list with a `200`, and
      the old branch also swallowed genuinely missing records
- [x] Add `app/actions/projects.ts` and `app/actions/events.ts`

### Auth — can lock you out

> [!WARNING]
> Test the full flow on a preview deployment against a staging database **before** production.

- [x] Retarget `app/actions/auth.ts` at `/auth/login`; `lib/session.ts`, the sign-out route and `proxy.ts` are unchanged and still correct
- [ ] JWT claim names, expiry, and cookie attributes all line up with FastAPI
- [ ] Changing the session cookie name signs everyone out — acceptable, but do it deliberately
- [ ] Check `proxy.ts`'s matcher when adding a protected route; it excludes `api` and `_next`

### New screens

- [x] Projects management — net-new across API, admin, and site
- [x] Events — speakers, photos, recordings, and links as repeatable field groups
- [x] **Build the repeatable-field pattern once, reusably.** Four of them land in the events form
- [x] Grouped navigation — `navigation.ts` is five titled groups, not a flat list
- [x] Dashboard counting what is **live**, including projects and events
- [x] **Comments** — moderation, not authoring. Hide (reversible), edit, delete, or reply as the
      author. The only screen that shows a commenter's email; the public endpoint returns a model
      with no field for one
- [x] Blog list shows view and reaction counts, read-only — readers write those

### Ordering ✅

- [x] **Drag to reorder**, opt-in per screen through `ResourceManager`'s `reorder` prop. Tools uses
      it; the other seven screens are untouched and can enable it with one prop
- [x] Grip handle, live position number, and up/down arrows on every row. The arrows are not a
      nicety — native HTML5 drag does not work on touch and is not keyboard-reachable at all
- [x] One request per commit, not one PATCH per row
- [x] Optimistic: the row moves under the cursor, and a failed save snaps back and says so
- [x] **Positions read 1..N with 1 at the top**, while the API keeps sorting `order` descending.
      The inversion lives in `lib/crud.ts` alone, so tools does not behave backwards from the
      seven other collections that share the convention

### Cleanup

- [x] `/events` keeps its path and is rebuilt on the v2 model — the `sessions` rename is reverted
- [x] Remove the standalone-blog-era fields — no absolute `blog.dileepa.dev` link or banner URL
      remains in the tree
- [x] Delete `components/ui/ToastDemo.tsx`, a development artefact

### Testing

- [x] `npm run lint` and `npm run build` both clean; `tsc --noEmit` and Prettier too
- [ ] Exercise every flow against a real API — create, edit, delete. A form that renders is
      not a form that saves. **Reorder is done**: drag and the arrow controls were both driven in
      a browser against a live API, and the new order verified in the response
- [ ] Create a project in admin → it renders on the main site
- [ ] Create an event with speakers, photos, and a recording → it renders correctly, and the photos appear in the site's gallery
- [ ] Every pre-existing content type still manages correctly
- [ ] Both themes and narrow widths

### Documentation and release

- [x] `README.md` describes what the app actually does — screens, comments moderation, reordering
- [ ] Re-record or re-caption the demo video; it shows the v1.0 UI
- [x] `CHANGELOG.md` entries under Added, Changed, Fixed, Removed
- [x] Version → `2.0.0` in `package.json`
- [ ] Merge `feat/v2.0.0`; tag `v2.0.0`
- [ ] Close [issue #4](https://github.com/dileepadev/admin-dileepa-dev/issues/4)
