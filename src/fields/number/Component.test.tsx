import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vi-axe';
import type { NumberField } from '../../core/model';
import { t } from '../../i18n/t';
import { renderField } from '../../test/render-field';
import { NumberComponent } from './Component';

// TC-C02. The control is a text input with a numeric keyboard, not type=number: browsers disagree
// about Persian digits in type=number, and a text input lets the person type them. The definition
// reads the digits (core/digits.ts); the component only has to report what was typed.
const field = (overrides: Partial<NumberField> = {}): NumberField => ({
  kind: 'number',
  name: 'year',
  label: 'سال ساخت',
  required: false,
  rules: {},
  ...overrides,
});

describe('NumberComponent', () => {
  it('is a text input with a decimal keyboard, not a native number input', () => {
    renderField(NumberComponent, { field: field() });
    const control = screen.getByLabelText('سال ساخت');
    expect(control).toHaveAttribute('type', 'text');
    expect(control).toHaveAttribute('inputmode', 'decimal');
  });

  it('accepts Persian digits and reports them as typed', async () => {
    const { onChange } = renderField(NumberComponent, { field: field() });
    await userEvent.type(screen.getByRole('textbox'), '۱۳۹۸');
    expect(onChange).toHaveBeenLastCalledWith('۱۳۹۸');
    expect(screen.getByRole('textbox')).toHaveValue('۱۳۹۸');
  });

  it('accepts a decimal part and a minus sign', async () => {
    const { onChange } = renderField(NumberComponent, { field: field() });
    await userEvent.type(screen.getByRole('textbox'), '-12.5');
    expect(onChange).toHaveBeenLastCalledWith('-12.5');
  });

  it('shows an error with the bound written in Persian digits', () => {
    renderField(NumberComponent, {
      field: field(),
      errors: [{ code: 'too_small', params: { min: 1900 } }],
    });
    const control = screen.getByRole('textbox');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAccessibleDescription(t('too_small', { min: 1900 }));
    expect(control).toHaveAccessibleDescription(expect.stringContaining('۱۹۰۰'));
  });

  it('shows the placeholder, marks a required field, and reports blur and its ref', async () => {
    const { onBlur, inputRef } = renderField(NumberComponent, {
      field: field({ required: true, placeholder: 'سال ساخت را وارد کنید' }),
    });
    const control = screen.getByRole('textbox');
    expect(control).toHaveAttribute('placeholder', 'سال ساخت را وارد کنید');
    expect(control).toHaveAttribute('aria-required', 'true');
    expect(inputRef).toHaveBeenCalledWith(control);
    await userEvent.click(control);
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('can be disabled or read-only', () => {
    const { unmount } = renderField(NumberComponent, { field: field({ disabled: true }) });
    expect(screen.getByRole('textbox')).toBeDisabled();
    unmount();
    renderField(NumberComponent, { field: field({ readOnly: true }), value: '۱۴۰۰' });
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox')).toHaveValue('۱۴۰۰');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderField(NumberComponent, {
      field: field({ required: true }),
      errors: [{ code: 'not_a_number' }],
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
