import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { enMessages } from '../i18n/en-messages';
import { normalize } from '../fields/definitions';
import { DynamicFormProvider } from '../provider/dynamic-form-provider';
import { testUiKit } from '../test/test-ui-kit';
import type { UiKit } from '../ui-kit';
import { DynamicForm } from './DynamicForm';
import type { SubmitOutcome } from './outcome';

// ADR-0015, TC-C14 and TC-E21: the engine and the fields render through the UiKit contract and speak
// through the messages they are given. The same behaviour must hold for any kit and any language.
const payload = {
  schemaVersion: 2,
  fields: [
    {
      kind: 'text',
      name: 'brand',
      label: 'Brand',
      description: 'The maker',
      rules: { required: true },
    },
    { kind: 'number', name: 'year', label: 'Year', rules: { min: 1900 } },
    { kind: 'select', name: 'fuel', label: 'Fuel', options: [{ value: 'p', label: 'Petrol' }] },
    { kind: 'textarea', name: 'notes', label: 'Notes' },
    {
      kind: 'file',
      name: 'photos',
      label: 'Photos',
      multiple: true,
      rules: { maxBytes: 5 * 1024 * 1024 },
    },
  ],
};

function model() {
  const result = normalize(payload, 'integration');
  if (!result.ok) throw new Error('fixture must parse');
  return result.model;
}

type Setup = { ui?: UiKit; messages?: typeof enMessages };

function renderForm(
  setup: Setup,
  onSubmit: () => Promise<SubmitOutcome> = async () => ({ ok: true }),
) {
  const user = userEvent.setup();
  const result = render(
    <DynamicFormProvider {...setup}>
      <DynamicForm model={model()} onSubmit={onSubmit} />
    </DynamicFormProvider>,
  );
  return { user, ...result };
}

const kits = [
  ['the default kit', undefined],
  ['a different kit', testUiKit],
] as const;

describe.each(kits)('the form with %s', (_name, ui) => {
  const setup: Setup = { ...(ui ? { ui } : {}), messages: enMessages };

  it('renders every field with its label, hint and control wired together', () => {
    renderForm(setup);
    const brand = screen.getByRole('textbox', { name: /Brand/ });
    expect(brand).toHaveAccessibleDescription('The maker');
    expect(screen.getByRole('textbox', { name: /Year/ })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Fuel/ })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Notes/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Photos/ })).toBeInTheDocument();
  });

  it('shows an error under the field after a failed submit, and focuses that field', async () => {
    const { user } = renderForm(setup);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const brand = screen.getByRole('textbox', { name: /Brand/ });
    expect(brand).toHaveAccessibleDescription(expect.stringContaining('This field is required.'));
    expect(brand).toHaveFocus();
  });

  it('submits, and shows the success panel with its two actions', async () => {
    const onSubmit = vi.fn(async (): Promise<SubmitOutcome> => ({ ok: true }));
    const { user } = renderForm(setup, onSubmit);
    await user.type(screen.getByRole('textbox', { name: /Brand/ }), 'Peugeot');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('The form was submitted')).toBeVisible();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Edit and resubmit' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'New form' })).toBeVisible();
  });

  it('shows a network failure with a Retry action', async () => {
    const { user } = renderForm(setup, async () => ({ ok: false, kind: 'network' }));
    await user.type(screen.getByRole('textbox', { name: /Brand/ }), 'Peugeot');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('The form was not sent')).toBeVisible();
    expect(within(alert).getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  it('lists a chosen file and says how many there are', async () => {
    const { container, user } = renderForm(setup);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, new File(['abc'], 'front.png', { type: 'image/png' }));

    expect(screen.getByText('front.png')).toBeVisible();
    expect(screen.getByText('1 file(s) chosen.')).toBeVisible();
  });
});

describe('which kit was used', () => {
  it('leaves no trace of the default kit when another one is given', () => {
    const { container } = renderForm({ ui: testUiKit, messages: enMessages });
    expect(container.querySelectorAll('[data-kit="test"]').length).toBeGreaterThan(5);
    // The default kit's CSS Module class names all contain the component's file name.
    expect(container.innerHTML).not.toMatch(/_(control|button|field|alert)_/);
  });

  it('uses the default kit, and Persian, when nothing is given', () => {
    const { container } = renderForm({});
    expect(container.querySelector('[data-kit]')).toBeNull();
    expect(screen.getByRole('button', { name: 'ارسال' })).toBeVisible();
  });
});

describe('the language', () => {
  it('can be changed one message at a time', async () => {
    const custom = { ...enMessages, catalog: { ...enMessages.catalog, submit: 'Send it' } };
    renderForm({ messages: custom });
    expect(screen.getByRole('button', { name: 'Send it' })).toBeVisible();
  });

  it('writes numbers the way its locale does in an error', async () => {
    const { user } = renderForm({ messages: enMessages });
    await user.type(screen.getByRole('textbox', { name: /Year/ }), '1800');
    await user.tab();
    expect(await screen.findByText('The value must be at least 1900.')).toBeVisible();
  });
});
