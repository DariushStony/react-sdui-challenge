import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { onlineManager } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { axe } from 'vi-axe';
import { t } from '@dynamic-form/renderer';
import { server } from '../test/server';
import { FormPage } from './FormPage';
import { Providers } from './providers';

// The page that owns a form: it loads it, shows what went wrong when it cannot, and sends the
// submission. These tests run against the shared mock handlers, so they cross the real fetch path.
const show = (formId: string) =>
  render(
    <Providers>
      <FormPage formId={formId} />
    </Providers>,
  );

const png = (name: string, content = 'x') => new File([content], name, { type: 'image/png' });
const fileInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type="file"]')!;

async function fillCarV2(user: ReturnType<typeof userEvent.setup>, brand = 'پژو') {
  await user.type(await screen.findByLabelText(/^برند/), brand);
  await user.type(screen.getByLabelText(/^سال ساخت/), '2019');
  await user.selectOptions(screen.getByLabelText(/^نوع سوخت/), 'petrol');
}

describe('loading (TC-E01 to TC-E03)', () => {
  it('shows a loading state first, then the form', async () => {
    show('car');
    expect(screen.getByRole('status')).toHaveTextContent(t('loading_form'));
    await screen.findByLabelText(/^برند/);
    expect(screen.queryByText(t('loading_form'))).not.toBeInTheDocument();
  });

  it('renders every field of the legacy sample in order, with the colon removed from its label', async () => {
    const { container } = show('car');
    await screen.findByLabelText(/^برند/);

    const labels = [...container.querySelectorAll('label')].map((label) => label.textContent);
    expect(labels).toEqual([
      'برند',
      'مدل',
      'سال ساخت',
      'نوع سوخت',
      'رنگ ماشین',
      'تعداد مالکین قبلی',
      'توضیحات وضعیت فنی',
      'تصاویر ماشین',
    ]);
    expect(screen.getByRole('heading', { level: 1, name: t('form_default_title') })).toBeVisible();
  });

  it('applies the rules of a v2 form and shows its own title', async () => {
    const user = userEvent.setup();
    show('car-v2');
    const brand = await screen.findByLabelText(/^برند/);
    expect(screen.getByRole('heading', { level: 1, name: 'ثبت آگهی خودرو' })).toBeVisible();

    await user.click(brand);
    await user.paste('a'.repeat(41));
    await user.tab();
    expect(await screen.findByText(t('too_long', { max: 40 }))).toBeVisible();
  });
});

describe('when the form cannot be loaded (TC-E04)', () => {
  it('shows an error with Retry, and Retry loads the form', async () => {
    const user = userEvent.setup();
    show('flaky-load');
    expect(await screen.findByRole('alert')).toHaveTextContent(t('load_error_title'));

    await user.click(screen.getByRole('button', { name: t('retry') }));
    expect(await screen.findByLabelText(/^برند/)).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the error when the form is still missing after Retry', async () => {
    const user = userEvent.setup();
    show('missing');
    await user.click(await screen.findByRole('button', { name: t('retry') }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(t('load_error_title')));
    expect(screen.getByRole('button', { name: t('retry') })).toBeEnabled();
  });

  it('says which status the server answered, as technical detail', async () => {
    show('missing');
    expect(await screen.findByText(/404/)).toBeInTheDocument();
  });
});

describe('when the payload is not usable (TC-E05)', () => {
  it.each([
    ['outdated', t('rejected_outdated')],
    ['unknown-required', t('rejected_unknown_required_kind', { field: 'score' })],
    ['broken', t('rejected_invalid')],
    ['duplicate-names', t('rejected_duplicate_name', { field: 'brand' })],
  ])('says so, specifically, for "%s"', async (formId, message) => {
    show(formId);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t('rejected_title'));
    expect(alert).toHaveTextContent(message);
    expect(screen.queryByRole('button', { name: t('submit') })).not.toBeInTheDocument();
  });

  it('lists what is wrong with the payload for the developer', async () => {
    show('broken');
    await screen.findByRole('alert');
    expect(screen.getByText(t('technical_details'))).toBeInTheDocument();
  });

  it('shows the form without an unknown optional field, and logs a warning that names it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    show('unknown-optional');

    await screen.findByLabelText(/^برند/);
    expect(screen.queryByText('امتیاز')).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('score'));
  });
});

describe('submitting (TC-E09, TC-E12 to TC-E15)', () => {
  it('sends one multipart request with every field and both files, then shows the success panel', async () => {
    const user = userEvent.setup();
    const seen: { type: string | null; brand: unknown; images: string[] }[] = [];
    server.use(
      http.post('*/api/forms/car-v2/submissions', async ({ request }) => {
        const form = await request.formData();
        seen.push({
          type: request.headers.get('content-type'),
          brand: form.get('brand'),
          images: form
            .getAll('car_images')
            .map((part) => (typeof part === 'string' ? part : part.name)),
        });
        return HttpResponse.json({ id: 'sub_1' }, { status: 201 });
      }),
    );

    const { container } = show('car-v2');
    await fillCarV2(user);
    await user.upload(fileInput(container), [png('front.png'), png('rear.png')]);
    await user.click(screen.getByRole('button', { name: t('submit') }));

    expect(await screen.findByText(t('submit_success_title'))).toBeVisible();
    expect(seen).toHaveLength(1);
    expect(seen[0]?.type).toMatch(/^multipart\/form-data; boundary=/);
    expect(seen[0]?.brand).toBe('پژو');
    expect(seen[0]?.images).toEqual(['front.png', 'rear.png']);
  });

  it('shows the fallback text of an error code it has no text for under the field, and keeps the data', async () => {
    const user = userEvent.setup();
    show('car-v2');
    await fillCarV2(user, 'bad');
    await user.click(screen.getByRole('button', { name: t('submit') }));

    expect(await screen.findByText(/این برند در سامانه پذیرفته نمی/)).toBeVisible();
    expect(screen.getByLabelText(/^برند/)).toHaveValue('bad');
    expect(screen.getByLabelText(/^سال ساخت/)).toHaveValue('2019');
  });

  it('shows a form-level error from the server, and keeps the data', async () => {
    const user = userEvent.setup();
    show('closed');
    await user.type(await screen.findByLabelText(/^برند/), 'پژو');
    await user.click(screen.getByRole('button', { name: t('submit') }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/پذیرای پاسخ/);
    expect(screen.getByLabelText(/^برند/)).toHaveValue('پژو');
  });

  it('shows an error for a field the form does not have in the form-level alert', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('*/api/forms/car-v2/submissions', () =>
        HttpResponse.json(
          { errors: { surprise: [{ code: 'unknown_field', message: 'فیلد ناشناس' }] } },
          { status: 422 },
        ),
      ),
    );
    show('car-v2');
    await fillCarV2(user);
    await user.click(screen.getByRole('button', { name: t('submit') }));

    expect(await screen.findByRole('alert')).toHaveTextContent('فیلد ناشناس');
    expect(screen.getByLabelText(/^برند/)).toHaveValue('پژو');
  });

  it('offers Retry after a failed submit, keeps the data, and succeeds when retried', async () => {
    const user = userEvent.setup();
    show('flaky-submit');
    await user.type(await screen.findByLabelText(/^برند/), 'پژو');
    await user.click(screen.getByRole('button', { name: t('submit') }));

    expect(await screen.findByText(t('network_error_title'))).toBeVisible();
    expect(screen.getByLabelText(/^برند/)).toHaveValue('پژو');

    await user.click(screen.getByRole('button', { name: t('retry') }));
    expect(await screen.findByText(t('submit_success_title'))).toBeVisible();
  });

  it.each([
    ['a 503 answer', () => new HttpResponse(null, { status: 503 })],
    ['a dropped connection', () => HttpResponse.error()],
  ])('treats %s as a failure to retry', async (_name, respond) => {
    const user = userEvent.setup();
    server.use(http.post('*/api/forms/car/submissions', respond));
    show('car');
    await user.type(await screen.findByLabelText(/^برند/), 'پژو');
    await user.click(screen.getByRole('button', { name: t('submit') }));

    expect(await screen.findByText(t('network_error_title'))).toBeVisible();
    expect(screen.getByRole('button', { name: t('retry') })).toBeEnabled();
    expect(screen.getByLabelText(/^برند/)).toHaveValue('پژو');
  });
});

// The browser's "offline" flag is a guess (a captive portal, a flaky Wi-Fi radio). By default the
// query library waits for it to say "online" before it even tries, which would leave the spinner or
// the busy button on screen for ever. The request is always attempted, and its failure is shown.
describe('when the browser says it is offline', () => {
  afterEach(() => onlineManager.setOnline(true));

  it('still loads the form', async () => {
    onlineManager.setOnline(false);
    show('car');
    expect(await screen.findByLabelText(/^برند/)).toBeVisible();
  });

  it('still sends the submission, and shows its failure when the request fails', async () => {
    onlineManager.setOnline(false);
    const user = userEvent.setup();
    server.use(http.post('*/api/forms/car/submissions', () => HttpResponse.error()));
    show('car');
    await user.type(await screen.findByLabelText(/^برند/), 'پژو');
    await user.click(screen.getByRole('button', { name: t('submit') }));

    expect(await screen.findByText(t('network_error_title'))).toBeVisible();
  });
});

describe('accessibility (TC-A01, TC-A02)', () => {
  it.each(['car', 'car-v2'])('has no violations on the loaded "%s" form', async (formId) => {
    const { container } = show(formId);
    await screen.findByLabelText(/^برند/);
    expect(await axe(container)).toHaveNoViolations();
  });

  it.each(['missing', 'outdated'])('has no violations on the "%s" error state', async (formId) => {
    const { container } = show(formId);
    await screen.findByRole('alert');
    expect(await axe(container)).toHaveNoViolations();
  });
});
