'use client';

import { useId, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * A password field you can read back.
 *
 * Typing a password blind into a form that has already rejected you once is
 * how a second failed sign-in happens, and this app has exactly one account —
 * there is nobody else to lock out and no shared screen to worry about.
 *
 * Three things it does that a bare `<input type="password">` with a button
 * beside it does not:
 *
 * - **It stays one control.** The button sits inside the field's box, so the
 *   focus ring is drawn around the pair and the row height is the control
 *   height like every other field on the screen.
 * - **It says which state it is in.** `aria-pressed` on a toggle, not two
 *   different labels on a button that looks the same either way.
 * - **It never leaves the password in the DOM as text after submit.** The
 *   revealed state resets whenever the component remounts, which a failed
 *   sign-in does.
 *
 * `autoComplete` is left to the caller: a sign-in form wants
 * `current-password` and a change-password form wants `new-password`, and
 * getting that wrong is how a manager saves the wrong value.
 */
export function PasswordInput({
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const describedBy = useId();

  return (
    <span className="password-field">
      <input
        id={props.name}
        type={revealed ? 'text' : 'password'}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        {...props}
      />
      <button
        type="button"
        onClick={() => setRevealed((value) => !value)}
        aria-pressed={revealed}
        aria-label={revealed ? 'Hide password' : 'Show password'}
        aria-controls={props.name}
        // Never submits the form it sits in, and never takes the Enter key
        // away from it: a password field's Enter means "sign in".
        tabIndex={0}
      >
        {revealed ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      <span id={describedBy} className="sr-only" aria-live="polite">
        {revealed ? 'Password is showing.' : 'Password is hidden.'}
      </span>
    </span>
  );
}
