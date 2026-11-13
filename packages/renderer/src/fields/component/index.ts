import type { FieldError } from '../../core/issues/field-error';
import type { FieldModel } from '../../core/model/field-model';
import type { FieldValue } from '../../core/model/field-value';

/**
 * What the engine gives every field component. A component never sees react-hook-form, the network
 * or the payload, so it can be rendered and tested on its own (TDD 6.1).
 */
type FieldComponentProps<F extends FieldModel> = {
  readonly field: F;
  /** Unique per form instance; the label and the ids of the hint and the error derive from it. */
  readonly id: string;
  readonly value: FieldValue;
  readonly onChange: (next: FieldValue) => void;
  readonly onBlur: () => void;
  /** Coded errors for this field; the component shows their Persian text. */
  readonly errors: readonly FieldError[];
  /** Receives the focusable control, so the engine can focus the first invalid field. */
  readonly inputRef: (element: HTMLElement | null) => void;
};

export type { FieldComponentProps };
