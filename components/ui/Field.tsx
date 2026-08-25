import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * A labelled form control.
 *
 * The label, the control, and the error live in one component so a field
 * cannot be shipped without its error slot — which is how a form ends up
 * rejecting input and saying nothing.
 */
export function Field({
  label,
  name,
  required,
  hint,
  errors,
  children,
  className,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  errors?: string[];
  children: ReactNode;
  className?: string;
}) {
  const errorId = errors?.length ? `${name}-error` : undefined;

  return (
    <label className={cn('field', className)} htmlFor={name}>
      <span>
        {label}
        {required && (
          <span className="req" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {children}
      {hint && <span className="text-fg-muted text-xs">{hint}</span>}
      {errors?.length ? (
        <span className="field-error" id={errorId}>
          {errors.join(' ')}
        </span>
      ) : null}
    </label>
  );
}

/** A titled group of fields inside a form. */
export function Fieldset({
  legend,
  note,
  children,
  className,
}: {
  legend: string;
  note?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn('border-border-hairline border-t-[0.5px] pt-6', className)}>
      <legend className="sr-only">{legend}</legend>
      <p className="text-fg text-small font-mono">{legend}</p>
      {note && <p className="text-fg-muted mt-1 mb-4 text-xs">{note}</p>}
      <div className={cn('grid gap-4 sm:grid-cols-2', note ? '' : 'mt-4')}>{children}</div>
    </fieldset>
  );
}

export function Input({
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input id={props.name} aria-invalid={invalid || undefined} {...props} />;
}

export function Textarea({
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea id={props.name} aria-invalid={invalid || undefined} {...props} />;
}

export function Select({
  options,
  invalid,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  options: readonly { value: string; label: string }[];
  invalid?: boolean;
}) {
  return (
    <select id={props.name} aria-invalid={invalid || undefined} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/**
 * A checkbox, laid out inline.
 *
 * Browsers do not submit an unchecked box at all, so a hidden `off` value goes
 * first: without it, unchecking a box and saving leaves the old value in place
 * because the field simply is not in the request.
 */
export function Checkbox({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <div className="field">
      <span className="flex items-center gap-3">
        <input type="hidden" name={name} value="off" />
        <input
          type="checkbox"
          id={name}
          name={name}
          defaultChecked={defaultChecked}
          className="accent-brand h-4 w-4 flex-none"
        />
        <label htmlFor={name} className="text-fg text-small">
          {label}
        </label>
      </span>
      {hint && <span className="text-fg-muted text-xs">{hint}</span>}
    </div>
  );
}
