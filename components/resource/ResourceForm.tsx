'use client';

import { Checkbox, Field, Input, PasswordInput, Select, Textarea } from '@/components/ui';
import { ImageField } from '@/components/ui/ImageField';
import { RepeatableGroup } from '@/components/ui/RepeatableGroup';
import { humanise } from '@/lib/constants';
import { at, defaultValue, type Field as FieldDef, type FormSchema } from './fields';
import { cn } from '@/lib/utils';

/** Renders one control. Everything about which control is in the schema. */
export function Control({
  field,
  record,
  errors,
  namePrefix,
}: {
  field: FieldDef;
  record: unknown;
  errors?: Record<string, string[]>;
  /** Set inside a repeatable group: `speakers.0`. */
  namePrefix?: string;
}) {
  // `field.name` addresses the value on `record`; `name` addresses the form
  // field. Inside a repeatable group those differ — `record` is the row and the
  // form field is `speakers.0.name` — which is the whole reason both exist.
  const name = namePrefix ? `${namePrefix}.${field.name}` : field.name;
  const value = defaultValue(record, field);
  const fieldErrors = errors?.[name];

  if (field.kind === 'checkbox') {
    return (
      <Checkbox
        name={name}
        label={field.label}
        hint={field.hint}
        errors={fieldErrors}
        className={cn(field.wide && 'wide')}
        defaultChecked={Boolean(at(record, field.name))}
      />
    );
  }

  if (field.kind === 'image') {
    return (
      <ImageField
        name={name}
        label={field.label}
        defaultValue={value}
        folder={field.folder}
        required={field.required}
        hint={field.hint}
        errors={fieldErrors}
        className={cn(field.wide && 'wide')}
      />
    );
  }

  if (field.kind === 'logo') {
    // Two URLs, one per theme. A logo that works on both foundations is
    // normal, so the dark field is optional and falls back to the light one.
    return (
      <div className="form-grid wide col-span-full">
        <ImageField
          name={`${name}.light`}
          label={`${field.label} — light theme`}
          defaultValue={String(at(record, `${field.name}.light`) ?? '')}
          folder={field.folder}
        />
        <ImageField
          name={`${name}.dark`}
          label={`${field.label} — dark theme`}
          defaultValue={String(at(record, `${field.name}.dark`) ?? '')}
          folder={field.folder}
          hint="Leave empty to reuse the light one."
        />
      </div>
    );
  }

  const control =
    field.kind === 'textarea' || field.kind === 'lines' ? (
      <Textarea
        name={name}
        defaultValue={value}
        placeholder={field.placeholder}
        required={field.required}
        rows={field.rows}
        invalid={Boolean(fieldErrors?.length)}
      />
    ) : field.kind === 'select' ? (
      <Select
        name={name}
        defaultValue={value}
        invalid={Boolean(fieldErrors?.length)}
        options={(field.options ?? []).map((option) => ({
          value: option,
          label: humanise(option),
        }))}
      />
    ) : field.kind === 'password' ? (
      <PasswordInput
        name={name}
        autoComplete="new-password"
        placeholder={field.placeholder}
        required={field.required}
        invalid={Boolean(fieldErrors?.length)}
      />
    ) : (
      <Input
        name={name}
        type={
          field.kind === 'datetime'
            ? 'datetime-local'
            : field.kind === 'date'
              ? 'date'
              : field.kind === 'number'
                ? 'number'
                : field.kind === 'url'
                  ? 'url'
                  : field.kind === 'email'
                    ? 'email'
                    : 'text'
        }
        defaultValue={value}
        placeholder={field.placeholder}
        required={field.required}
        invalid={Boolean(fieldErrors?.length)}
      />
    );

  return (
    <Field
      name={name}
      label={field.label}
      required={field.required}
      hint={field.hint}
      errors={fieldErrors}
      className={cn(field.wide && 'wide')}
    >
      {control}
    </Field>
  );
}

/**
 * A form, from its description.
 *
 * Each section is a **card**, not a rule. They used to be `<fieldset>`s
 * separated by a top border, which drew a line across the page between every
 * pair of groups and left the fields themselves floating on the page
 * background — so a form with six sections read as six horizontal rules with
 * controls scattered between them, and on the community form, which has three
 * short sections, the rules outnumbered the fields.
 *
 * A card is what the rest of the platform uses to say "this is one object",
 * and a section of a form is one object. The legend sits inside it, the note
 * under the legend, and the fields in a two-column grid whose row gap is
 * larger than its column gap — because a label needs to be nearer its own
 * control than to the field above it, and one uniform `gap` cannot say that.
 */
export function ResourceForm({
  schema,
  record,
  errors,
}: {
  schema: FormSchema;
  record: unknown;
  errors?: Record<string, string[]>;
}) {
  return (
    <div className="form">
      {schema.sections.map((section) => (
        <fieldset className="form-section" key={section.legend}>
          <legend className="sr-only">{section.legend}</legend>
          <div className="form-section-head">
            <div className="min-w-0">
              <p className="form-section-title">{section.legend}</p>
              {section.note && <p className="form-section-note">{section.note}</p>}
            </div>
          </div>
          <div className="form-grid">
            {section.fields.map((field) => (
              <Control key={field.name} field={field} record={record} errors={errors} />
            ))}
          </div>
        </fieldset>
      ))}

      {schema.groups?.map((group) => (
        <RepeatableGroup
          key={group.name}
          legend={group.legend}
          note={group.note}
          addLabel={group.addLabel}
          initial={(at(record, group.name) as unknown[]) ?? []}
          blank={{}}
        >
          {(row, index) =>
            group.fields.map((field) => (
              <Control
                key={field.name}
                field={field}
                record={row}
                errors={errors}
                namePrefix={`${group.name}.${index}`}
              />
            ))
          }
        </RepeatableGroup>
      ))}
    </div>
  );
}
