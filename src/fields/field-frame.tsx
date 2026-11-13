import type { ReactNode } from 'react';
import type { FieldError } from '../core/issues';
import type { FieldModel } from '../core/model';
import { describeError } from '../i18n/t';
import { Field, describedBy, type ControlSize } from '../ui';

/** What every control needs from the frame: ids, ARIA state and the field's own flags. */
export type ControlProps = {
  id: string;
  'aria-describedby': string | undefined;
  'aria-required': true | undefined;
  invalid: boolean;
  disabled?: true;
  readOnly?: true;
  size?: ControlSize;
};

type FieldFrameProps = {
  field: FieldModel;
  id: string;
  errors: readonly FieldError[];
  /** Replaces the field's own hint, for a component that needs to add to it. */
  hint?: string | undefined;
  children: (control: ControlProps) => ReactNode;
};

/**
 * The part every field component shares: the label, the hint, the error text and the ARIA wiring
 * between them and the control. The component only supplies the control (ADR-0010).
 */
export function FieldFrame({ field, id, errors, hint, children }: FieldFrameProps) {
  const error = errors.length > 0 ? errors.map(describeError).join('\n') : undefined;
  const description = hint ?? field.description;

  const control: ControlProps = {
    id,
    'aria-describedby': describedBy(id, {
      // The same test `Field` uses to decide whether the hint is rendered: an empty one is not.
      description: Boolean(description),
      error: error !== undefined,
    }),
    'aria-required': field.required ? true : undefined,
    invalid: error !== undefined,
    ...(field.disabled ? { disabled: true as const } : {}),
    ...(field.readOnly ? { readOnly: true as const } : {}),
    ...(field.size ? { size: field.size } : {}),
  };

  return (
    <Field
      id={id}
      label={field.label}
      required={field.required}
      description={description}
      error={error}
    >
      {children(control)}
    </Field>
  );
}
