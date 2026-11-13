import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vi-axe';
import { t } from '@dynamic-form/renderer';
import { PRESETS, presetText } from './presets';
import { PlaygroundView } from './PlaygroundView';

// TC-P01, TC-P02, TC-P03 (AC-17, FR-35 to FR-37): the Playground is a thin view over the same
// normalizer and form engine as the app.
const editor = () => screen.getByLabelText(t('playground_json'));
const preview = () => screen.getByRole('region', { name: t('playground_preview') });

async function replaceText(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.clear(editor());
  await user.click(editor());
  await user.paste(text);
}

afterEach(() => {
  document.documentElement.dir = 'rtl';
});

describe('presets (TC-P01)', () => {
  it('starts with the first preset: its JSON in the editor and its form in the preview', () => {
    render(<PlaygroundView />);
    expect(editor()).toHaveValue(presetText(PRESETS[0]!));
    expect(within(preview()).getByLabelText(/^برند/)).toBeVisible();
  });

  it('offers every preset by name', () => {
    render(<PlaygroundView />);
    const options = within(screen.getByLabelText(t('playground_preset'))).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(
      PRESETS.map((preset) => t(preset.labelKey)),
    );
  });

  it.each(['legacy', 'v2', 'server-error'])(
    'choosing "%s" fills the editor with its JSON and shows its form',
    async (id) => {
      const user = userEvent.setup();
      render(<PlaygroundView />);
      await user.selectOptions(screen.getByLabelText(t('playground_preset')), id);

      expect(editor()).toHaveValue(presetText(PRESETS.find((preset) => preset.id === id)!));
      expect(within(preview()).getByLabelText(/^برند/)).toBeVisible();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  it('shows the skipped field of the optional-unknown preset as a warning, and still renders the form', async () => {
    const user = userEvent.setup();
    render(<PlaygroundView />);
    await user.selectOptions(screen.getByLabelText(t('playground_preset')), 'unknown-optional');

    expect(screen.getByRole('status')).toHaveTextContent(t('warnings_title', { count: 1 }));
    expect(within(preview()).getByLabelText(/^برند/)).toBeVisible();
  });

  it('shows the rejection reason of the required-unknown preset, and no form', async () => {
    const user = userEvent.setup();
    render(<PlaygroundView />);
    await user.selectOptions(screen.getByLabelText(t('playground_preset')), 'unknown-required');

    expect(screen.getByRole('alert')).toHaveTextContent(
      t('rejected_unknown_required_kind', { field: 'score' }),
    );
    expect(within(preview()).queryByRole('button', { name: t('submit') })).not.toBeInTheDocument();
  });
});

describe('editing the JSON (TC-P02)', () => {
  it.each(['{', 'not json', '{"fields": ['])(
    'explains the invalid JSON %j and does not crash',
    async (text) => {
      const user = userEvent.setup();
      render(<PlaygroundView />);
      await replaceText(user, text);

      expect(screen.getByRole('alert')).toHaveTextContent(t('json_invalid_title'));
      expect(
        within(preview()).queryByRole('button', { name: t('submit') }),
      ).not.toBeInTheDocument();
    },
  );

  it('renders the form as soon as the JSON becomes valid', async () => {
    const user = userEvent.setup();
    render(<PlaygroundView />);
    await replaceText(user, '{');
    await replaceText(
      user,
      '{"schemaVersion": 2, "fields": [{"kind": "text", "name": "nick", "label": "لقب"}]}',
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(within(preview()).getByLabelText('لقب')).toBeVisible();
  });

  it('asks for JSON when the editor is empty', async () => {
    const user = userEvent.setup();
    render(<PlaygroundView />);
    await user.clear(editor());

    expect(screen.getByRole('status')).toHaveTextContent(t('json_empty'));
  });

  it('turns valid JSON that is not a form into a rejection', async () => {
    const user = userEvent.setup();
    render(<PlaygroundView />);
    await replaceText(user, '{"fields": "nope"}');

    expect(screen.getByRole('alert')).toHaveTextContent(t('rejected_invalid'));
  });
});

describe('submitting the preview (TC-P03)', () => {
  async function fillV2(user: ReturnType<typeof userEvent.setup>) {
    await user.selectOptions(screen.getByLabelText(t('playground_preset')), 'v2');
    const form = within(preview());
    await user.type(form.getByLabelText(/^برند/), 'پژو');
    await user.type(form.getByLabelText(/^سال ساخت/), '2019');
    await user.selectOptions(form.getByLabelText(/^نوع سوخت/), 'petrol');
  }

  it('shows the request that would be sent and sends nothing', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<PlaygroundView />);
    await fillV2(user);
    await user.click(screen.getByRole('button', { name: t('submit') }));

    expect(await screen.findByText(t('dry_run_title'))).toBeVisible();
    expect(screen.getByText(/POST \/api\/forms\/playground\/submissions/)).toBeVisible();
    expect(screen.getByText(/brand: "پژو"/)).toBeVisible();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('answers with server errors for the server-error preset', async () => {
    const user = userEvent.setup();
    render(<PlaygroundView />);
    await user.selectOptions(screen.getByLabelText(t('playground_preset')), 'server-error');
    const form = within(preview());
    await user.type(form.getByLabelText(/^برند/), 'پژو');
    await user.type(form.getByLabelText(/^سال ساخت/), '2019');
    await user.selectOptions(form.getByLabelText(/^نوع سوخت/), 'petrol');
    await user.click(screen.getByRole('button', { name: t('submit') }));

    expect(await screen.findByText(t('form_errors_title'))).toBeVisible();
    expect(screen.getByText(t('dry_run_simulated_error'))).toBeVisible();
    expect(screen.getByLabelText(/^برند/)).toHaveValue('پژو');
  });

  it('can be told to answer with a network failure', async () => {
    const user = userEvent.setup();
    render(<PlaygroundView />);
    await fillV2(user);
    await user.selectOptions(screen.getByLabelText(t('playground_result')), 'network');
    await user.click(screen.getByRole('button', { name: t('submit') }));

    expect(await screen.findByText(t('network_error_title'))).toBeVisible();
  });
});

describe('direction', () => {
  it('flips the page between right-to-left and left-to-right, and puts it back on leaving', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<PlaygroundView />);
    const toggle = screen.getByRole('button', { name: t('playground_direction') });

    await user.click(toggle);
    expect(document.documentElement.dir).toBe('ltr');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await user.click(toggle);
    expect(document.documentElement.dir).toBe('rtl');

    await user.click(toggle);
    unmount();
    expect(document.documentElement.dir).toBe('rtl');
  });
});

describe('accessibility', () => {
  it('has no violations with the form, and with a rejection', async () => {
    const user = userEvent.setup();
    const { container } = render(<PlaygroundView />);
    expect(await axe(container)).toHaveNoViolations();

    await user.selectOptions(screen.getByLabelText(t('playground_preset')), 'unknown-required');
    expect(await axe(container)).toHaveNoViolations();
  });
});
