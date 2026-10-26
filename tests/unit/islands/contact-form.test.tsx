import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ContactForm from '@/components/patterns/ContactForm';
import en from '@/i18n/en.json';

const t = en.contact;
const props = {
  web3formsKey: 'key',
  projectTypes: ['Contract', 'Other'],
  successMessage: 'Thanks, sent.',
  errorMessage: 'Could not send.',
  fallbackEmail: 'me@example.com',
};

function setup(responses: (() => Promise<Response>)[] = []) {
  const post = vi.fn<typeof fetch>();
  for (const response of responses) post.mockImplementationOnce(response);
  vi.stubGlobal('fetch', post);
  render(<ContactForm {...props} />);
  return { user: userEvent.setup(), post };
}

const ok = () => Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(t.name), 'Ada');
  await user.type(screen.getByLabelText(t.email), 'ada@example.com');
  await user.selectOptions(screen.getByLabelText(t.projectType), 'Contract');
  await user.type(screen.getByLabelText(t.message), 'A message that is long enough.');
}

afterEach(() => vi.unstubAllGlobals());

describe('ContactForm', () => {
  it('shows errors on blur, linked to the field and announced', async () => {
    const { user } = setup();
    await user.click(screen.getByLabelText(t.email));
    await user.tab();
    const email = screen.getByLabelText(t.email);
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(t.errors.emailRequired);
    expect(screen.getByRole('alert')).toHaveTextContent(t.errors.emailRequired);
  });

  it('blocks an invalid submit, focuses the first invalid field and sends nothing', async () => {
    const { user, post } = setup();
    await user.click(screen.getByRole('button', { name: t.submit }));
    expect(await screen.findAllByRole('alert')).toHaveLength(4);
    expect(screen.getByLabelText(t.name)).toHaveFocus();
    expect(post).not.toHaveBeenCalled();
  });

  it('replaces the form with the success message and moves focus to it', async () => {
    const { user, post } = setup([ok]);
    await fill(user);
    await user.click(screen.getByRole('button', { name: t.submit }));
    const success = await screen.findByText(props.successMessage);
    expect(success).toHaveFocus();
    expect(screen.queryByRole('button')).toBeNull();
    expect(post).toHaveBeenCalledOnce();
  });

  it('keeps the data after a network error and succeeds on retry', async () => {
    const { user, post } = setup([() => Promise.reject(new Error('offline')), ok]);
    await fill(user);
    await user.click(screen.getByRole('button', { name: t.submit }));
    expect(await screen.findByRole('alert')).toHaveTextContent(props.errorMessage);
    expect(screen.getByLabelText(t.name)).toHaveValue('Ada');

    await user.click(screen.getByRole('button', { name: t.retry }));
    expect(await screen.findByText(props.successMessage)).toBeInTheDocument();
    expect(post).toHaveBeenCalledTimes(2);
  });
});
