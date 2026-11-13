import { render } from '@testing-library/react';
import { useState, type ComponentType } from 'react';
import type { FieldError } from '../../core/issues/field-error';
import type { FieldModel } from '../../core/model/field-model';
import type { FieldValue } from '../../core/model/field-value';
import type { FieldComponentProps } from '../../fields/component';

type Options<F extends FieldModel> = {
  field: F;
  value?: FieldValue;
  errors?: readonly FieldError[];
  id?: string;
};

/**
 * Renders one field component the way the form engine would: it owns the value, and reports every
 * change, blur and ref to spies. Component tests use this so they never depend on react-hook-form.
 */
function renderField<F extends FieldModel>(
  Component: ComponentType<FieldComponentProps<F>>,
  options: Options<F>,
) {
  const onChange = vi.fn<(next: FieldValue) => void>();
  const onBlur = vi.fn();
  const inputRef = vi.fn<(element: HTMLElement | null) => void>();

  function Controlled() {
    const [value, setValue] = useState<FieldValue>(options.value ?? '');
    return (
      <Component
        field={options.field}
        id={options.id ?? options.field.name}
        value={value}
        errors={options.errors ?? []}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
        onBlur={onBlur}
        inputRef={inputRef}
      />
    );
  }

  return { ...render(<Controlled />), onChange, onBlur, inputRef };
}

export { renderField };
