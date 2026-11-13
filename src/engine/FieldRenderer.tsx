import { Controller, type Control } from 'react-hook-form';
import type { FieldModel, FormValues } from '../core/model';
import type { FieldKind } from '../fields';
import { codedErrorsOf } from './resolver';

type FieldRendererProps = {
  field: FieldModel;
  kind: FieldKind;
  control: Control<FormValues>;
  id: string;
};

/**
 * Renders one field with the component of its kind. `Controller` keeps each field's state to
 * itself, so typing in one field does not re-render the others, and it hands the field component
 * only plain props: it never sees react-hook-form.
 */
export function FieldRenderer({ field, kind, control, id }: FieldRendererProps) {
  const { Component } = kind;
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: state, fieldState }) => (
        <Component
          field={field}
          id={id}
          value={state.value}
          onChange={state.onChange}
          onBlur={state.onBlur}
          errors={codedErrorsOf(fieldState.error)}
          inputRef={state.ref}
        />
      )}
    />
  );
}
