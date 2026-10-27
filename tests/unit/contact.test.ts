import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { loadRenderers } from 'astro:container';
import { describe, expect, it, vi } from 'vitest';
import ContactFormSection from '@/components/patterns/ContactFormSection.astro';
import en from '@/i18n/en.json';
import {
  contactPayload,
  contactSchema,
  sendContact,
  validateContact,
  WEB3FORMS_URL,
} from '@/lib/contact';

const types = ['Contract', 'Other'];
const valid = {
  name: 'Ada',
  email: 'ada@example.com',
  projectType: 'Contract',
  message: 'A message that is long enough.',
  botcheck: '',
};
const issues = (values: typeof valid) => validateContact(values, types).errors ?? {};

describe('contactSchema / validateContact (SPEC §5.6)', () => {
  it('accepts a complete message and trims whitespace', () => {
    const result = contactSchema(types).safeParse({ ...valid, name: '  Ada  ' });
    expect(result.success && result.data.name).toBe('Ada');
  });

  it('reports each invalid field with its message', () => {
    const t = en.contact.errors;
    expect(
      issues({ ...valid, name: '   ', email: '', projectType: 'Nope', message: 'short' }),
    ).toEqual({
      name: t.nameRequired,
      email: t.emailRequired,
      projectType: t.projectTypeRequired,
      message: t.messageTooShort,
    });
    expect(issues({ ...valid, email: 'not-an-email' })).toEqual({ email: t.emailInvalid });
    expect(issues({ ...valid, message: 'x'.repeat(2001) })).toEqual({ message: t.messageTooLong });
  });
});

describe('sendContact', () => {
  const reply = (body: object, ok = true) =>
    vi.fn<typeof fetch>().mockResolvedValue({ ok, json: async () => body } as Response);

  it('posts the payload as JSON to Web3Forms and reports success', async () => {
    const post = reply({ success: true });
    expect(await sendContact(valid, 'key', post)).toBe(true);
    const [url, init] = post.mock.calls[0];
    expect(url).toBe(WEB3FORMS_URL);
    expect(JSON.parse(init!.body as string)).toEqual(contactPayload(valid, 'key'));
    expect(contactPayload(valid, 'key')).toMatchObject({
      access_key: 'key',
      subject: 'Portfolio contact: Contract',
    });
  });

  it('reports failure on a rejected message, an HTTP error or a network error', async () => {
    expect(await sendContact(valid, 'key', reply({ success: false }))).toBe(false);
    expect(await sendContact(valid, 'key', reply({ success: true }, false))).toBe(false);
    expect(
      await sendContact(
        valid,
        'key',
        vi.fn<typeof fetch>().mockRejectedValue(new Error('offline')),
      ),
    ).toBe(false);
  });

  it('drops a filled honeypot without posting', async () => {
    const post = reply({ success: true });
    expect(await sendContact({ ...valid, botcheck: 'spam' }, 'key', post)).toBe(true);
    expect(post).not.toHaveBeenCalled();
  });
});

describe('ContactFormSection', () => {
  const site = {
    contact: { intro: '', projectTypes: types, successMessage: 'ok', errorMessage: 'err' },
    links: { email: 'me@example.com' },
  };

  it('renders the form only when there is an access key', async () => {
    const renderers = await loadRenderers([getContainerRenderer()]);
    const container = await AstroContainer.create({ renderers });
    const render = (web3formsKey: string) =>
      container.renderToString(ContactFormSection, { props: { web3formsKey, site } });
    expect(await render('')).not.toContain('<form');
    const html = await render('abc');
    expect(html).toContain('<form');
    expect(html).toContain('aria-labelledby="form-title"');
    expect(html).not.toMatch(/backdrop-blur|shadow-glow/);
  });
});
