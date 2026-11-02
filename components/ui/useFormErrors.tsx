'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type FormHTMLAttributes,
} from 'react';

/** What to say when a field is empty, and when it holds the wrong kind of value. */
export interface FieldMessages {
  missing: string;
  invalid?: string;
}

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface FormErrors {
  errors: Record<string, string>;
  recheck: (event: FormEvent<Control>) => void;
}

const FormErrorsContext = createContext<FormErrors>({ errors: {}, recheck: () => {} });

/** The client-side message for one field, and the handler that keeps it current. */
export function useFieldError(name: string | undefined) {
  const { errors, recheck } = useContext(FormErrorsContext);
  return { error: name ? errors[name] : undefined, recheck };
}

/**
 * Copy for a field the form did not write copy for. It reads the field's own
 * label, so "Title" says "Enter the title." rather than the browser's bubble.
 */
function labelOf(control: Control): string {
  const text = control.labels?.[0]?.querySelector('span')?.textContent ?? '';
  return text.replace(/\*$/, '').trim().toLowerCase();
}

const INVALID: Record<string, string> = {
  email: 'Enter an email address like you@example.com.',
  url: 'Enter a full web address, starting with https://.',
  number: 'Enter a number.',
};

/**
 * The admin's own form validation messages, matching the main site's forms.
 *
 * The browser's bubble is a different shape, font and wording in every browser,
 * none of them this app's. The rules stay the browser's (`required`,
 * `type="email"`, read through the constraint validation API), so nothing is
 * checked twice; what changes is how a failure is shown:
 *
 * - the form is `noValidate`, so no bubble appears;
 * - on submit every field is checked, each failure is written under its field
 *   in the error colour, and focus moves to the first one;
 * - once shown, a message follows the field as it is edited and clears the
 *   moment the value is acceptable. Nothing is checked before a first submit,
 *   so nobody is told off for a field they have not reached.
 *
 * `messages` is keyed by each field's `name`.
 */
export function useFormErrors(messages: Record<string, FieldMessages> = {}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const messageFor = useCallback(
    (control: Control): string | null => {
      if (control.validity.valid) return null;
      const copy = messages[control.name];
      if (control.validity.valueMissing) {
        if (copy?.missing) return copy.missing;
        const label = labelOf(control);
        const verb = control instanceof HTMLSelectElement ? 'Choose' : 'Enter';
        return label ? `${verb} the ${label}.` : 'Fill in this field.';
      }
      const type = control instanceof HTMLInputElement ? control.type : '';
      return copy?.invalid ?? INVALID[type] ?? copy?.missing ?? 'Check this field.';
    },
    [messages],
  );

  /** Checks every field; shows what failed and focuses the first. */
  const validate = useCallback(
    (form: HTMLFormElement): boolean => {
      const next: Record<string, string> = {};
      let first: Control | null = null;
      for (const element of Array.from(form.elements)) {
        if (
          !(element instanceof HTMLInputElement) &&
          !(element instanceof HTMLTextAreaElement) &&
          !(element instanceof HTMLSelectElement)
        ) {
          continue;
        }
        if (!element.willValidate || !element.name) continue;
        const message = messageFor(element);
        if (message) {
          next[element.name] = message;
          first ??= element;
        }
      }
      setErrors(next);
      first?.focus();
      return first === null;
    },
    [messageFor],
  );

  const recheck = useCallback(
    (event: FormEvent<Control>) => {
      const control = event.currentTarget;
      setErrors((current) => {
        if (!(control.name in current)) return current;
        const message = messageFor(control);
        if (message === current[control.name]) return current;
        const next = { ...current };
        if (message) next[control.name] = message;
        else delete next[control.name];
        return next;
      });
    },
    [messageFor],
  );

  return { errors, validate, recheck };
}

/**
 * A form that shows its own validation messages. Fields and `Field` read them
 * from context, so a form needs nothing beyond using this in place of `<form>`.
 */
export function ValidatedForm({
  messages,
  onSubmit,
  children,
  ...props
}: FormHTMLAttributes<HTMLFormElement> & { messages?: Record<string, FieldMessages> }) {
  const { errors, validate, recheck } = useFormErrors(messages);
  const value = useMemo(() => ({ errors, recheck }), [errors, recheck]);

  return (
    <form
      {...props}
      noValidate
      onSubmit={(event) => {
        onSubmit?.(event);
        if (!validate(event.currentTarget)) event.preventDefault();
      }}
    >
      <FormErrorsContext.Provider value={value}>{children}</FormErrorsContext.Provider>
    </form>
  );
}
