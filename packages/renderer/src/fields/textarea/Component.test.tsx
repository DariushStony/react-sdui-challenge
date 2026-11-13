import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vi-axe';
import type { TextareaField } from '../../core/model';
import { t } from '../../test/t';
import { renderField } from '../../test/render-field';
import { TextareaComponent } from './Component';

// TC-C03: a multi-line control with the same labelling and error wiring as the single-line one.
const field = (overrides: Partial<TextareaField> = {}): TextareaField => ({
  kind: 'textarea',
  name: 'technical_condition',
  label: 'توضیحات وضعیت فنی',
  required: false,
  rules: {},
  ...overrides,
});

describe('TextareaComponent', () => {
  it('shows the label and a multi-line control', () => {
    renderField(TextareaComponent, { field: field() });
    const control = screen.getByLabelText('توضیحات وضعیت فنی');
    expect(control).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('keeps line breaks in the value it reports', async () => {
    const { onChange } = renderField(TextareaComponent, { field: field() });
    await userEvent.type(screen.getByRole('textbox'), 'الف{Enter}ب');
    expect(onChange).toHaveBeenLastCalledWith('الف\nب');
  });

  it('shows the placeholder and an error with its Persian text', () => {
    renderField(TextareaComponent, {
      field: field({ placeholder: 'توضیحات' }),
      errors: [{ code: 'too_long', params: { max: 500 } }],
    });
    const control = screen.getByRole('textbox');
    expect(control).toHaveAttribute('placeholder', 'توضیحات');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAccessibleDescription(t('too_long', { max: 500 }));
  });

  it('reports a blur and hands its control to inputRef', async () => {
    const { onBlur, inputRef } = renderField(TextareaComponent, { field: field() });
    expect(inputRef).toHaveBeenCalledWith(screen.getByRole('textbox'));
    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('can be disabled or read-only', () => {
    const { unmount } = renderField(TextareaComponent, { field: field({ disabled: true }) });
    expect(screen.getByRole('textbox')).toBeDisabled();
    unmount();
    renderField(TextareaComponent, { field: field({ readOnly: true }) });
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderField(TextareaComponent, {
      field: field({ required: true, description: 'هینت' }),
      errors: [{ code: 'required' }],
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
