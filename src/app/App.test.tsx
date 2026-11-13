import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { t } from '../i18n/t';
import { App } from './App';

const png = (name: string) => new File(['x'], name, { type: 'image/png' });
const fileInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type="file"]')!;

afterEach(() => {
  window.location.hash = '';
});

describe('App', () => {
  // TC-P06: the one test through the real composition: providers, page, API client, mock handlers.
  it('loads the form from the brief, takes a submission with two images, and can edit or start over', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.type(await screen.findByLabelText(/^برند/), 'پژو');
    await user.type(screen.getByLabelText(/^سال ساخت/), '2019');
    await user.selectOptions(screen.getByLabelText(/^نوع سوخت/), 'بنزین');
    await user.upload(fileInput(container), [png('front.png'), png('rear.png')]);
    await user.click(screen.getByRole('button', { name: t('submit') }));

    expect(await screen.findByText(t('submit_success_title'))).toBeVisible();

    await user.click(screen.getByRole('button', { name: t('edit_again') }));
    expect(screen.getByLabelText(/^برند/)).toHaveValue('پژو');
    expect(screen.getByText('front.png')).toBeVisible();
    expect(screen.getByText('rear.png')).toBeVisible();

    await user.click(screen.getByRole('button', { name: t('submit') }));
    await user.click(await screen.findByRole('button', { name: t('new_form') }));
    expect(screen.getByLabelText(/^برند/)).toHaveValue('');
    expect(screen.queryByText('front.png')).not.toBeInTheDocument();
  });

  // TC-E18: a different form starts with its own state.
  it('starts a different form empty when the address changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(await screen.findByLabelText(/^برند/), 'پژو');

    act(() => {
      window.location.hash = '#/forms/car-v2';
    });

    expect(await screen.findByRole('heading', { level: 1, name: 'ثبت آگهی خودرو' })).toBeVisible();
    expect(screen.getByLabelText(/^برند/)).toHaveValue('');
  });

  // TC-P04: a worker that cannot start is explained, and the app still mounts.
  it('shows why the mock could not start, and still shows the form', async () => {
    render(<App mockFailure="service workers are blocked" />);

    expect(await screen.findByLabelText(/^برند/)).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent(t('mock_failed_title'));
    expect(screen.getByRole('alert')).toHaveTextContent('service workers are blocked');
  });

  it('shows no notice when the mock started fine', async () => {
    render(<App />);
    await screen.findByLabelText(/^برند/);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
