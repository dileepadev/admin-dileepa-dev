import type { TableColumn } from '@/components/ui/DataTable';

/**
 * A form, described rather than written.
 *
 * Eight screens needed the same form: labelled controls, per-field errors,
 * repeatable groups, an image picker. Eight hand-written versions is eight
 * places a focus ring or an error slot goes missing. This is the description;
 * `ResourceForm` is the one renderer.
 */

export type FieldKind =
  | 'text'
  | 'url'
  | 'email'
  | 'date'
  | 'datetime'
  | 'number'
  | 'textarea'
  /** Comma-separated on one line — tags, a stack, a technology list. */
  | 'list'
  /** A textarea where blank lines separate entries — the About paragraphs. */
  | 'lines'
  | 'select'
  | 'checkbox'
  /** Masked, with a reveal toggle. */
  | 'password'
  /** A Cloudinary URL, with an upload button beside it. */
  | 'image'
  /** Two Cloudinary URLs, one per theme. */
  | 'logo';

export interface Field {
  kind: FieldKind;
  /** The form field name. Dots address nested values: `location.venue`. */
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  /** `select` only. */
  options?: readonly string[];
  /** Span both columns of the two-column grid. */
  wide?: boolean;
  /** `textarea` and `lines` only. Defaults to the CSS minimum of ~5 rows. */
  rows?: number;
  /** The Cloudinary folder an upload lands in. `image` and `logo` only. */
  folder?: string;
}

export interface Group {
  /** The form-field prefix: `speakers` produces `speakers.0.name`. */
  name: string;
  legend: string;
  note?: string;
  addLabel: string;
  fields: Field[];
}

export interface FormSection {
  legend: string;
  note?: string;
  fields: Field[];
}

export interface FormSchema {
  sections: FormSection[];
  groups?: Group[];
}

/**
 * Read a dotted path off a record.
 *
 * The schema addresses nested values by path so the same renderer can drive a
 * flat resource and a nested one without either knowing about the other.
 */
export function at(record: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined,
      record,
    );
}

/** The default value for a field, formatted the way its control expects. */
export function defaultValue(record: unknown, field: Field): string {
  const raw = at(record, field.name);
  if (raw === null || raw === undefined) return '';

  if (field.kind === 'list') return Array.isArray(raw) ? raw.join(', ') : String(raw);
  if (field.kind === 'lines') return Array.isArray(raw) ? raw.join('\n\n') : String(raw);

  // `datetime-local` will not accept an offset or a trailing Z, and a date
  // input wants exactly ten characters. Both silently render empty otherwise,
  // which looks like the record has no date.
  if (field.kind === 'datetime') return String(raw).slice(0, 16);
  if (field.kind === 'date') return String(raw).slice(0, 10);

  return String(raw);
}

/**
 * A table column, described by a screen.
 *
 * The same type `DataTable` renders, aliased here so a screen imports one
 * module rather than two — and so there is one definition of what a column is
 * rather than two that drift.
 */
export type Column<T> = TableColumn<T>;
