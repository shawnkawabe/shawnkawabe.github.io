// Contact form rules (SPEC §5.6): one zod schema shared by the island and its tests, and the
// Web3Forms submission. zod/mini and no form library keep the island inside the 80 KB JS budget
// (ARCHITECTURE §9, ADR 0004).
import * as z from 'zod/mini';
import { contact } from '@/i18n/en.json';

export const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 2000;

export type ContactErrorText = typeof contact.errors;

/** Messages come from the page's locale (`strings(locale).contact.errors`); English by default. */
export function contactSchema(
  projectTypes: readonly string[],
  t: ContactErrorText = contact.errors,
) {
  return z.object({
    name: z.string().check(z.trim(), z.minLength(1, t.nameRequired)),
    email: z
      .string()
      .check(z.trim(), z.minLength(1, t.emailRequired), z.email({ error: t.emailInvalid })),
    projectType: z
      .string()
      .check(z.refine((value) => projectTypes.includes(value), { error: t.projectTypeRequired })),
    message: z
      .string()
      .check(
        z.trim(),
        z.minLength(MESSAGE_MIN, t.messageTooShort),
        z.maxLength(MESSAGE_MAX, t.messageTooLong),
      ),
    /** Honeypot: people never see it, so anything typed here comes from a bot. */
    botcheck: z.string(),
  });
}

export type ContactValues = z.infer<ReturnType<typeof contactSchema>>;
export type ContactField = keyof ContactValues;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const EMPTY_CONTACT: ContactValues = {
  name: '',
  email: '',
  projectType: '',
  message: '',
  botcheck: '',
};

/** Parsed values, or the first problem of each field (the message the form shows). */
export function validateContact(
  values: ContactValues,
  projectTypes: readonly string[],
  errorText?: ContactErrorText,
): { data: ContactValues; errors?: undefined } | { data?: undefined; errors: ContactErrors } {
  const result = contactSchema(projectTypes, errorText).safeParse(values);
  if (result.success) return { data: result.data };
  const errors: ContactErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ContactField;
    errors[field] ??= issue.message;
  }
  return { errors };
}

export function contactPayload(values: ContactValues, web3formsKey: string) {
  return {
    access_key: web3formsKey,
    subject: `Portfolio contact: ${values.projectType}`,
    name: values.name,
    email: values.email,
    project_type: values.projectType,
    message: values.message,
    botcheck: values.botcheck,
  };
}

/** True when Web3Forms accepted the message. A filled honeypot is dropped but reported as sent. */
export async function sendContact(
  values: ContactValues,
  web3formsKey: string,
  post: typeof fetch = fetch,
): Promise<boolean> {
  if (values.botcheck) return true;
  try {
    const response = await post(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(contactPayload(values, web3formsKey)),
    });
    const result = (await response.json()) as { success?: boolean };
    return response.ok && result.success === true;
  } catch {
    return false;
  }
}
