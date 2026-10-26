// SPEC §5.6 contact form: inline validation on blur and submit, Web3Forms POST, and four states
// (idle, submitting, success, error). Plain React state and native controls keep the island small
// enough for the 80 KB budget (ADR 0004); the zod schema lives in src/lib/contact.ts.
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import {
  EMPTY_CONTACT,
  MESSAGE_MAX,
  MESSAGE_MIN,
  sendContact,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactValues,
} from '@/lib/contact';
import type { Strings } from '@/lib/i18n';
import { format } from '@/lib/seo';

export type ContactFormProps = {
  /** Labels and messages in the page's locale (`strings(locale).contact`). */
  t: Strings['contact'];
  web3formsKey: string;
  projectTypes: string[];
  successMessage: string;
  errorMessage: string;
  fallbackEmail: string;
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

const FIELDS: ContactField[] = ['name', 'email', 'projectType', 'message'];

const CONTROL =
  'w-full rounded-sm border border-border-2 bg-surface-1 px-3 text-3 text-on-surface-1 transition-[border-color,box-shadow] duration-150 ease-standard focus:border-accent-1 focus:shadow-glow focus:outline-none aria-invalid:border-error';
const BUTTON =
  'inline-flex h-12 items-center justify-center gap-2 self-start rounded-pill bg-accent-1 px-5 text-3 font-medium text-on-accent transition-colors duration-150 ease-standard hover:bg-accent-1-strong disabled:opacity-60';

export default function ContactForm({
  t,
  web3formsKey,
  projectTypes,
  successMessage,
  errorMessage,
  fallbackEmail,
}: ContactFormProps) {
  const formId = useId();
  const [values, setValues] = useState<ContactValues>(EMPTY_CONTACT);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const successRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const fieldError = (field: ContactField, next: ContactValues) =>
    validateContact(next, projectTypes, t.errors).errors?.[field];

  /** Change keeps typing quiet: it only clears or updates an error that is already showing. */
  const change = (field: ContactField, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) setErrors({ ...errors, [field]: fieldError(field, next) });
  };

  const blur = (field: ContactField) =>
    setErrors({ ...errors, [field]: fieldError(field, values) });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === 'submitting') return;
    const result = validateContact(values, projectTypes, t.errors);
    if (result.errors) {
      setErrors(result.errors);
      const first = FIELDS.find((field) => result.errors[field]);
      document.getElementById(`${formId}-${first}`)?.focus();
      return;
    }
    setStatus('submitting');
    setStatus((await sendContact(result.data, web3formsKey)) ? 'success' : 'error');
  };

  if (status === 'success') {
    return (
      <p
        ref={successRef}
        tabIndex={-1}
        className="rounded-lg border border-border-1 bg-surface-2 p-6 text-4 focus:outline-none"
      >
        {successMessage}
      </p>
    );
  }

  const control = (field: ContactField) => ({
    id: `${formId}-${field}`,
    name: field,
    value: values[field],
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => change(field, event.target.value),
    onBlur: () => blur(field),
  });

  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex flex-col gap-5 rounded-lg border border-border-1 bg-surface-2/80 p-6 backdrop-blur-md transition-[border-color,box-shadow] duration-250 ease-standard focus-within:border-border-2 focus-within:shadow-glow sm:p-8"
    >
      <Field id={`${formId}-name`} label={t.name} error={errors.name}>
        {(a11y) => (
          <input
            {...control('name')}
            {...a11y}
            type="text"
            autoComplete="name"
            className={`${CONTROL} h-11`}
          />
        )}
      </Field>
      <Field id={`${formId}-email`} label={t.email} error={errors.email}>
        {(a11y) => (
          <input
            {...control('email')}
            {...a11y}
            type="email"
            autoComplete="email"
            className={`${CONTROL} h-11`}
          />
        )}
      </Field>
      <Field id={`${formId}-projectType`} label={t.projectType} error={errors.projectType}>
        {(a11y) => (
          <select {...control('projectType')} {...a11y} className={`${CONTROL} h-11`}>
            <option value="" disabled>
              {t.projectTypePlaceholder}
            </option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field
        id={`${formId}-message`}
        label={t.message}
        error={errors.message}
        hint={format(t.messageHint, { min: MESSAGE_MIN, max: MESSAGE_MAX })}
      >
        {(a11y) => (
          <textarea {...control('message')} {...a11y} rows={6} className={`${CONTROL} py-2`} />
        )}
      </Field>

      {/* Honeypot (SPEC §5.6): hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          {t.honeypot}
          <input
            {...control('botcheck')}
            id={undefined}
            onBlur={undefined}
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {status === 'error' && (
        <p role="alert" className="rounded-sm border border-error p-4 text-2">
          {errorMessage}{' '}
          <a href={`mailto:${fallbackEmail}`} className="underline">
            {fallbackEmail}
          </a>
        </p>
      )}

      <button type="submit" disabled={status === 'submitting'} className={BUTTON}>
        {status === 'submitting' && (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-pill border-2 border-current border-t-transparent"
          />
        )}
        {status === 'submitting' ? t.submitting : status === 'error' ? t.retry : t.submit}
      </button>
    </form>
  );
}

type FieldA11y = {
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
  'aria-required': true;
};

type FieldProps = {
  id: string;
  label: string;
  error: string | undefined;
  hint?: string;
  children: (a11y: FieldA11y) => ReactNode;
};

function Field({ id, label, error, hint, children }: FieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-2 font-medium">
        {label}
      </label>
      {children({
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
        'aria-required': true,
      })}
      {hint && (
        <p id={hintId} className="text-1 text-on-surface-2">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-2 text-error">
          {error}
        </p>
      )}
    </div>
  );
}
