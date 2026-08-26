/**
 * The API's shapes, hand-written.
 *
 * `dileepa-dev` generates these from the OpenAPI spec with `openapi-typescript`
 * and so should this app eventually — that is a Phase 5 item. Until then these
 * are written out, and they are the *admin's* view: every field is editable, so
 * they follow the `-Input` side of a model rather than the `-Output` one.
 */

export interface Resource {
  id: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  published: boolean;
  order: number;
}

export interface Logo {
  light: string;
  dark: string;
}

export interface Image {
  url: string;
  alt: string;
}

export interface Series {
  name: string;
  order: number;
}

export interface Seo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
}

export interface About {
  id: string;
  name: string;
  title: string;
  tagline: string;
  /** The supporting line under the tagline in the site's hero. */
  taglineDescription?: string;
  location: string;
  description: string[];
  status: string;
  images: {
    profilePng?: string;
    profileWebp?: string;
    /** New in v2.0.0. WebP and PNG are unchanged and still preferred first. */
    profileJpg?: string;
    bannerWebp?: string;
  };
  links: Record<string, string>;
  connect: string[];
}

export interface Experience extends Resource {
  title: string;
  company: string;
  url: string;
  period: string;
  description: string;
  technologies: string[];
  logo: Logo;
}

export interface Education extends Resource {
  course: string;
  institution: string;
  period: string;
  description: string;
  url: string;
  logo: Logo;
}

export interface Tool extends Resource {
  name: string;
  logo: Logo;
}

export interface Community extends Resource {
  name: string;
  role: string;
  period: string;
  description: string;
  communityUrl: string;
  logo: Logo;
  current: boolean;
}

export interface Video extends Resource {
  title: string;
  date: string;
  link: string;
  thumbnail: string;
  /** Optional: every video that predates the field has none. */
  description: string;
}

export interface BlogPost extends Resource {
  slug: string;
  title: string;
  description: string;
  path: string;
  canonicalUrl: string;
  publishedDate: string | null;
  updatedDate: string | null;
  tags: string[];
  series: Series | null;
  readingTimeMinutes: number;
  draft: boolean;
  featured: boolean;
  sourcePath: string;
  contentHash: string;
  seo: Seo;
}

export type ProjectStatus = 'active' | 'maintained' | 'archived' | 'concept';

export interface GalleryItem {
  url: string;
  alt: string;
  caption?: string | null;
  order: number;
}

export interface Metric {
  label: string;
  value: string;
}

export interface Project extends Resource {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
  role: string | null;
  period: { start: string | null; end: string | null } | null;
  stack: string[];
  categories: string[];
  tags: string[];
  featured: boolean;
  links: Record<string, string | null>;
  cover: Image | null;
  gallery: GalleryItem[];
  highlights: string[];
  metrics: Metric[];
  seo: Seo;
}

export type EventType = 'workshop' | 'talk' | 'webinar' | 'meetup' | 'bootcamp' | 'panel' | 'other';
export type EventFormat = 'in_person' | 'online' | 'hybrid';
export type EventStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Speaker {
  name: string;
  role?: string | null;
  profileUrl?: string | null;
  avatarUrl?: string | null;
  isHost: boolean;
}

export interface Photo {
  url: string;
  alt: string;
  caption?: string | null;
  credit?: string | null;
  width?: number | null;
  height?: number | null;
  order: number;
}

export interface Recording {
  platform: 'youtube' | 'linkedin' | 'other';
  url: string;
  embedUrl?: string | null;
  durationSeconds?: number | null;
  language?: string | null;
}

export interface EventLink {
  label: string;
  url: string;
  kind: 'registration' | 'announcement' | 'repo' | 'resource' | 'recap';
}

export interface EventRecord extends Resource {
  slug: string;
  title: string;
  summary: string;
  description: string;
  type: EventType;
  format: EventFormat;
  startAt: string;
  endAt: string | null;
  timezone: string;
  /** Derived from `startAt` on read unless pinned. Only `cancelled` is worth setting. */
  status: EventStatus;
  location: {
    venue?: string | null;
    city?: string | null;
    country?: string | null;
    mapUrl?: string | null;
  } | null;
  /** The conference or meetup series the event ran under, not the event itself. */
  host: { name: string; organizer?: string | null; organizerUrl?: string | null } | null;
  speakers: Speaker[];
  cover: Image | null;
  photos: Photo[];
  recordings: Recording[];
  slides: { url: string; provider?: string | null } | null;
  links: EventLink[];
  tags: string[];
  featured: boolean;
  audienceSize: number | null;
  seo: Seo;
}

export interface UploadRecord {
  id: string;
  url: string;
  publicId: string;
  folder: string;
  fileName: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  format: string | null;
}

// --- The API's own endpoints ------------------------------------------------

/**
 * `GET /api-links` — what each screen's endpoint is, and what it expects.
 *
 * Derived by the API from its own route table, so it cannot describe a surface
 * that is not the one being served. Admin-only: the public site neither reads
 * it nor could, having no credentials.
 */
export type EndpointAuth = 'public' | 'admin' | 'api_key' | 'admin_or_api_key';

export type ParameterLocation = 'path' | 'query' | 'header' | 'body';

export interface EndpointParameter {
  name: string;
  location: ParameterLocation;
  type: string;
  required: boolean;
  description?: string | null;
}

export interface Endpoint {
  method: string;
  /** The routed path, placeholders intact: `/communities/{identifier}`. */
  path: string;
  url: string;
  summary: string;
  auth: EndpointAuth;
  parameters: EndpointParameter[];
}

/** Every endpoint under one OpenAPI tag — which is one screen's worth. */
export interface ApiLink {
  key: string;
  label: string;
  description: string;
  basePath: string;
  url: string;
  docsUrl?: string | null;
  endpoints: Endpoint[];
}
