import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vi-axe';
import type { TextField } from '../../core/model';
import { t } from '../../test/t';
import { renderField } from '../../test/render-field';
import { TextComponent } from './Component';

// TC-C01, TC-C09, TC-C10 for the single-line text field.
const field = (overrides: Partial<TextField> = {}): TextField => ({
  kind: 'text',
  name: 'brand',
  label: 'برند',
  required: false,
  rules: {},
  ...overrides,
});

describe('TextComponent', () => {
  it('shows the label and connects it to the control', () => {
    renderField(TextComponent, { field: field() });
    expect(screen.getByLabelText('برند')).toBe(screen.getByRole('textbox'));
  });

  it('reports what is typed, as text, and shows it', async () => {
    const { onChange } = renderField(TextComponent, { field: field() });
    await userEvent.type(screen.getByRole('textbox'), 'پژو');
    expect(onChange).toHaveBeenLastCalledWith('پژو');
    expect(screen.getByRole('textbox')).toHaveValue('پژو');
  });

  it('starts from the value it is given', () => {
    renderField(TextComponent, { field: field(), value: 'سمند' });
    expect(screen.getByRole('textbox')).toHaveValue('سمند');
  });

  it('reports a blur', async () => {
    const { onBlur } = renderField(TextComponent, { field: field() });
    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('hands its control to inputRef, so the engine can focus it', () => {
    const { inputRef } = renderField(TextComponent, { field: field() });
    expect(inputRef).toHaveBeenCalledWith(screen.getByRole('textbox'));
  });

  it('shows no error state when there is no error', () => {
    renderField(TextComponent, { field: field() });
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('');
  });

  it('shows the Persian text of an error, marks the control invalid and describes it by the error', () => {
    renderField(TextComponent, { field: field(), errors: [{ code: 'required' }] });
    const control = screen.getByRole('textbox');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAccessibleDescription(t('required'));
  });

  it('fills the error text with its params', () => {
    renderField(TextComponent, {
      field: field(),
      errors: [{ code: 'too_long', params: { max: 40 } }],
    });
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(t('too_long', { max: 40 }));
  });

  it('marks a required field for assistive technology and with a visible symbol', () => {
    renderField(TextComponent, { field: field({ required: true }) });
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not mark an optional field as required', () => {
    renderField(TextComponent, { field: field() });
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('shows the placeholder and the hint, and describes the control by the hint', () => {
    renderField(TextComponent, {
      field: field({ placeholder: 'برند را وارد کنید', description: 'نام سازنده' }),
    });
    const control = screen.getByRole('textbox');
    expect(control).toHaveAttribute('placeholder', 'برند را وارد کنید');
    expect(control).toHaveAccessibleDescription('نام سازنده');
  });

  it('describes the control by the hint and the error together', () => {
    renderField(TextComponent, {
      field: field({ description: 'نام سازنده' }),
      errors: [{ code: 'required' }],
    });
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(`نام سازنده ${t('required')}`);
  });

  it('does not limit typing with an HTML maxlength, so a too-long value can be reported', async () => {
    renderField(TextComponent, { field: field({ rules: { maxLength: 3 } }) });
    await userEvent.type(screen.getByRole('textbox'), 'abcdef');
    expect(screen.getByRole('textbox')).not.toHaveAttribute('maxlength');
    expect(screen.getByRole('textbox')).toHaveValue('abcdef');
  });

  it('can be disabled', () => {
    renderField(TextComponent, { field: field({ disabled: true }) });
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('can be read-only, and still shows its value', () => {
    renderField(TextComponent, { field: field({ readOnly: true }), value: 'ثابت' });
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox')).toHaveValue('ثابت');
  });

  it('passes the size token on to the control', () => {
    renderField(TextComponent, { field: field({ size: 'large' }) });
    expect(screen.getByRole('textbox')).toHaveAttribute('data-size', 'large');
  });

  it('has no accessibility violations, plain and with an error', async () => {
    const plain = renderField(TextComponent, {
      field: field({ required: true, description: 'هینت' }),
    });
    expect(await axe(plain.container)).toHaveNoViolations();
    plain.unmount();

    const failing = renderField(TextComponent, { field: field(), errors: [{ code: 'required' }] });
    expect(await axe(failing.container)).toHaveNoViolations();
  });
});
