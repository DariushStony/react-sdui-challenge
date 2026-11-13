import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { axe } from 'vi-axe';
import { t } from '../i18n/t';
import { server } from '../test/server';
import { App } from './App';

// TC-A02 and TC-A03 (NFR-01, AC-19): the states that only appear after interaction, and a whole
// submission with the keyboard alone. Contrast cannot be measured in jsdom; the tokens file records
// the computed ratios instead.
afterEach(() => {
  window.location.hash = '';
});

describe('axe after interaction (TC-A02)', () => {
  it('finds no violations in the invalid form with its errors', async () => {
    window.location.hash = '#/forms/car-v2';
    const user = userEvent.setup();
    const { container } = render(<App />);
    await screen.findByLabelText(/^برند/);

    await user.click(screen.getByRole('button', { name: t('submit') }));
    expect((await screen.findAllByText(t('required'))).length).toBeGreaterThan(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('finds no violations in the success panel', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await user.type(await screen.findByLabelText(/^برند/), 'پژو');
    await user.click(screen.getByRole('button', { name: t('submit') }));
    await screen.findByText(t('submit_success_title'));

    expect(await axe(container)).toHaveNoViolations();
  });

  it('finds no violations in the server error and network failure banners', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('*/api/forms/car/submissions', () => new HttpResponse(null, { status: 503 })),
    );
    const { container } = render(<App />);
    await user.type(await screen.findByLabelText(/^برند/), 'پژو');
    await user.click(screen.getByRole('button', { name: t('submit') }));
    await screen.findByText(t('network_error_title'));

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('keyboard only (TC-A03)', () => {
  const payload = {
    schemaVersion: 2,
    title: 'فرم آزمایشی',
    fields: [
      { kind: 'text', name: 'name', label: 'نام', rules: { required: true } },
      { kind: 'number', name: 'age', label: 'سن' },
      { kind: 'textarea', name: 'notes', label: 'یادداشت' },
      { kind: 'file', name: 'photos', label: 'عکس‌ها', multiple: true },
    ],
  };

  it('reaches every control in order, lands on the first invalid one, and moves focus to the success panel', async () => {
    window.location.hash = '#/forms/keyboard';
    server.use(
      http.get('*/api/forms/keyboard', () => HttpResponse.json(payload)),
      http.post('*/api/forms/keyboard/submissions', () =>
        HttpResponse.json({ id: 's1' }, { status: 201 }),
      ),
    );
    const user = userEvent.setup();
    render(<App />);
    const name = await screen.findByLabelText(/^نام/);
    const age = screen.getByLabelText(/^سن/);
    const notes = screen.getByLabelText(/^یادداشت/);
    const submit = screen.getByRole('button', { name: t('submit') });
    const fileButton = screen.getByRole('button', { name: /عکس‌ها/ });

    // Tab order follows the page: the two links first, then the fields in the order of the payload.
    await user.tab();
    await user.tab();
    await user.tab();
    expect(name).toHaveFocus();
    await user.tab();
    expect(age).toHaveFocus();
    await user.tab();
    expect(notes).toHaveFocus();
    await user.tab();
    expect(fileButton).toHaveFocus();
    await user.tab();
    expect(submit).toHaveFocus();

    // Submitting with a required field empty puts focus on that field, not somewhere behind it.
    await user.keyboard('{Enter}');
    expect(await screen.findByText(t('required'))).toBeVisible();
    expect(name).toHaveFocus();

    await user.keyboard('مریم');
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(submit).toHaveFocus();
    await user.keyboard('{Enter}');

    // The success panel takes focus so the outcome is announced and keyboard users start from it.
    const panel = (await screen.findByText(t('submit_success_title'))).closest('[role="status"]');
    expect(panel).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: t('edit_again') })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByLabelText(/^نام/)).toHaveValue('مریم');
  });
});
