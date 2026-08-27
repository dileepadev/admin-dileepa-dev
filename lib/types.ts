/**
 * The API's shapes, named.
 *
 * `lib/api-schema.ts` is generated from `openapi.json` by `npm run api:types`
 * and is not edited by hand. It is accurate but unreadable — every type is a
 * path through `components["schemas"]`. This file gives the shapes the admin
 * actually uses their real names, and is the only place that reaches into the
 * generated file. `dileepa-dev/lib/api-types.ts` does the same job for the
 * public site.
 *
 * Regenerate both after an API change:
 *
 *     npm run api:types
 *
 * If a name here stops resolving, the API changed shape. That is the point:
 * the spec wins, and this file is where the break surfaces.
 *
 * These were hand-written until v2.0.0, and had drifted: the admin's `Comment`
 * declared an `order` the API does not return, its `EventRecord` was missing
 * `series` entirely, and its `UploadRecord` had neither `mimetype` nor
 * timestamps. Deriving them removes the class of bug rather than those three
 * instances of it.
 */

import type { components } from './api-schema';

type Schemas = components['schemas'];

/**
 * FastAPI emits a separate schema for a model whose read and write shapes
 * differ, suffixed `-Input` and `-Output`. The admin renders records it has
 * read, so the `Output` side is the one these names refer to; the write side is
 * reached through the `*Update` payloads below.
 */

// --- Shared building blocks -------------------------------------------------

export type Logo = Schemas['Logo'];
export type Image = Schemas['Image'];
export type Series = Schemas['Series'];
export type Seo = Schemas['Seo-Output'];
export type Period = Schemas['Period'];
export type ReactionCounts = Schemas['ReactionCounts'];

/**
 * The fields every ordered, publishable collection shares.
 *
 * Derived from `Tool`, which is the smallest resource carrying all of them, so
 * it cannot describe a base the API does not actually serve.
 */
export type Resource = Pick<
  Schemas['Tool'],
  'id' | 'createdAt' | 'updatedAt' | 'published' | 'order'
>;

// --- Resources --------------------------------------------------------------

export type About = Schemas['About'];
export type Experience = Schemas['Experience'];
export type Education = Schemas['Education'];
export type Tool = Schemas['Tool'];
export type Community = Schemas['Community'];
export type Video = Schemas['Video'];
export type BlogPost = Schemas['BlogPost'];
export type Project = Schemas['Project'];
export type EventRecord = Schemas['Event'];
export type UploadRecord = Schemas['UploadRecord'];

/**
 * A comment, as the admin sees it.
 *
 * The site sees a different shape. `email` and `key` exist only on this one —
 * the public endpoint returns `PublicComment`, which has no field for either,
 * so neither can reach a reader by accident. That type is deliberately not
 * exported here: the admin has no use for it.
 */
export type Comment = Schemas['Comment'];

// --- Project detail ---------------------------------------------------------

export type ProjectStatus = NonNullable<Project['status']>;
export type ProjectLinks = Schemas['ProjectLinks-Output'];
export type GalleryItem = Schemas['GalleryItem'];
export type Metric = Schemas['Metric'];

// --- Event detail -----------------------------------------------------------

export type EventType = NonNullable<EventRecord['type']>;
export type EventFormat = NonNullable<EventRecord['format']>;
export type EventStatus = EventRecord['status'];
export type Speaker = Schemas['Speaker-Output'];
export type Photo = Schemas['Photo'];
export type Recording = Schemas['Recording-Output'];
export type EventLink = Schemas['EventLink'];
export type EventLocation = Schemas['Location-Output'];
export type EventHost = Schemas['Host-Output'];
export type Slides = Schemas['Slides'];

// --- Database maintenance ---------------------------------------------------

/**
 * Development-only. The production API does not register these routes, so a
 * request for this shape against `api.dileepa.dev` is a 404 rather than a 403 —
 * which is what `getDatabaseStatus` returning `null` represents.
 */
/** The signed-in account, read fresh from the database by `GET /auth/profile`. */
export type UserProfile = Schemas['UserProfile'];

export type SystemStatus = Schemas['SystemStatus'];
export type Version = Schemas['Version'];

/**
 * What the admin could learn about the API it is pointed at.
 *
 * Three outcomes, kept apart because they call for three different things and
 * collapsing them produces an alarm that contradicts what the user can see:
 *
 * - `ok` — `/status` answered. Everything below the badge works.
 * - `partial` — the API answered, but has no `/status`. It is an older
 *   deployment than this admin, which is the normal state between shipping the
 *   dashboard and shipping the API. Every other screen works fine; only the
 *   database and maintenance rows cannot be filled in.
 * - `unreachable` — nothing answered. This is the only one worth a banner.
 */
export type Connection =
  | { state: 'ok'; status: SystemStatus }
  | { state: 'partial'; environment: string; version: string }
  | { state: 'unreachable' };
export type DatabaseStatus = Schemas['DatabaseStatus'];
export type CollectionCount = Schemas['CollectionCount'];
export type MaintenanceResult = Schemas['MaintenanceResult'];
export type CollectionResult = Schemas['CollectionResult'];

// --- The API's own endpoints ------------------------------------------------

/**
 * `GET /api-links` — what each screen's endpoint is, and what it expects.
 *
 * Derived by the API from its own route table, so it cannot describe a surface
 * that is not the one being served. Admin-only: the public site neither reads
 * it nor could, having no credentials.
 */
export type ApiLink = Schemas['ApiLink'];
export type Endpoint = Schemas['Endpoint'];
export type EndpointParameter = Schemas['EndpointParameter'];
export type EndpointAuth = Endpoint['auth'];
export type ParameterLocation = EndpointParameter['location'];
