import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vi-axe';
import type { SelectField } from '../../core/model';
import { t } from '../../test/t';
import { renderField } from '../../test/render-field';
import { SelectComponent } from './Component';

// TC-C04.
const options = [
  { value: 'petrol', label: 'بنزین' },
  { value: 'gas', label: 'گاز' },
];

const field = (overrides: Partial<SelectField> = {}): SelectField => ({
  kind: 'select',
  name: 'fuel_type',
  label: 'نوع سوخت',
  required: false,
  options,
  ...overrides,
});

describe('SelectComponent', () => {
  it('shows the label, a first "choose" entry and every option by its label', () => {
    renderField(SelectComponent, { field: field() });
    const control = screen.getByLabelText('نوع سوخت');
    expect(control).toBe(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      t('choose_option'),
      'بنزین',
      'گاز',
    ]);
  });

  it('reports the chosen value (not the label)', async () => {
    const { onChange } = renderField(SelectComponent, { field: field() });
    await userEvent.selectOptions(screen.getByRole('combobox'), 'gas');
    expect(onChange).toHaveBeenLastCalledWith('gas');
    expect(screen.getByRole('combobox')).toHaveValue('gas');
  });

  it('can go back to nothing chosen', async () => {
    const { onChange } = renderField(SelectComponent, { field: field(), value: 'gas' });
    await userEvent.selectOptions(screen.getByRole('combobox'), '');
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('starts from the value it is given', () => {
    renderField(SelectComponent, { field: field(), value: 'petrol' });
    expect(screen.getByRole('combobox')).toHaveValue('petrol');
  });

  it('shows the Persian text of an error and marks the control invalid', () => {
    renderField(SelectComponent, {
      field: field({ required: true }),
      errors: [{ code: 'required' }],
    });
    const control = screen.getByRole('combobox');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAttribute('aria-required', 'true');
    expect(control).toHaveAccessibleDescription(t('required'));
  });

  it('is disabled, with a clear message, when there are no options (EC-02)', () => {
    renderField(SelectComponent, { field: field({ options: [] }) });
    const control = screen.getByRole('combobox');
    expect(control).toBeDisabled();
    expect(control).toHaveAccessibleDescription(t('no_options'));
  });

  it('is disabled when the field is disabled, and when it is read-only (a select has no read-only)', () => {
    const { unmount } = renderField(SelectComponent, { field: field({ disabled: true }) });
    expect(screen.getByRole('combobox')).toBeDisabled();
    unmount();
    renderField(SelectComponent, { field: field({ readOnly: true }), value: 'gas' });
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('combobox')).toHaveValue('gas');
  });

  it('shows the hint, and reports blur and its ref', async () => {
    const { onBlur, inputRef } = renderField(SelectComponent, {
      field: field({ description: 'نوع سوخت خودرو' }),
    });
    const control = screen.getByRole('combobox');
    expect(control).toHaveAccessibleDescription('نوع سوخت خودرو');
    expect(inputRef).toHaveBeenCalledWith(control);
    await userEvent.click(control);
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderField(SelectComponent, {
      field: field({ required: true, description: 'هینت' }),
      errors: [{ code: 'required' }],
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
