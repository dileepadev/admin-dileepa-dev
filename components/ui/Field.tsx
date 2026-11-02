'use client';

import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFieldError } from './useFormErrors';

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
  // A message the form wrote on submit wins over the one the server sent back.
  const { error } = useFieldError(name);
  const messages = error ? [error] : (errors ?? []);
  const errorId = messages.length ? `${name}-error` : undefined;

  return (
    <label className={cn('field', className)} htmlFor={name}>
      <span className="flex items-center gap-1 font-medium">
        <span>{label}</span>
        {required && (
          <span className="req text-brand" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {children}
      {hint && <span className="hint leading-normal">{hint}</span>}
      {messages.length ? (
        <span className="field-error" id={errorId}>
          <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {messages.join(' ')}
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
    <fieldset className={cn('form-section', className)}>
      <legend className="sr-only">{legend}</legend>
      <div className="form-section-head">
        <div className="min-w-0">
          <p className="form-section-title">{legend}</p>
          {note && <p className="form-section-note">{note}</p>}
        </div>
      </div>
      <div className="form-grid">{children}</div>
    </fieldset>
  );
}

export function Input({
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const { error, recheck } = useFieldError(props.name);
  return (
    <input
      id={props.name}
      aria-invalid={invalid || error ? true : undefined}
      aria-describedby={error ? `${props.name}-error` : undefined}
      onInput={recheck}
      {...props}
    />
  );
}

export function Textarea({
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  const { error, recheck } = useFieldError(props.name);
  return (
    <textarea
      id={props.name}
      aria-invalid={invalid || error ? true : undefined}
      aria-describedby={error ? `${props.name}-error` : undefined}
      onInput={recheck}
      {...props}
    />
  );
}

export function Select({
  options,
  invalid,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  options: readonly { value: string; label: string }[];
  invalid?: boolean;
}) {
  const { error, recheck } = useFieldError(props.name);
  return (
    <select
      id={props.name}
      aria-invalid={invalid || error ? true : undefined}
      aria-describedby={error ? `${props.name}-error` : undefined}
      onChange={recheck}
      {...props}
    >
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
  errors,
  className,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
  errors?: string[];
  className?: string;
}) {
  return (
    <div className={cn('checkbox-field', className)}>
      <label htmlFor={name} className="flex cursor-pointer items-start gap-3 select-none">
        <input type="hidden" name={name} value="off" />
        <input
          type="checkbox"
          id={name}
          name={name}
          defaultChecked={defaultChecked}
          className="accent-brand-fill mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded"
        />
        <div className="min-w-0 flex-1">
          <span className="text-fg text-small block leading-snug font-medium">{label}</span>
          {hint && (
            <span className="text-fg-muted text-label mt-1 block leading-normal">{hint}</span>
          )}
        </div>
      </label>
      {errors?.length ? (
        <span className="field-error mt-1">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {errors.join(' ')}
        </span>
      ) : null}
    </div>
  );
}
