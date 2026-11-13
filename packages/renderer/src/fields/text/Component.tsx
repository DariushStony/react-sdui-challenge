import type { TextField } from '../../core/model';
import { TextInput } from '../../ui';
import type { FieldComponentProps } from '../component';
import { FieldFrame } from '../field-frame';

export function TextComponent({
  field,
  id,
  value,
  onChange,
  onBlur,
  errors,
  inputRef,
}: FieldComponentProps<TextField>) {
  return (
    <FieldFrame field={field} id={id} errors={errors}>
      {(control) => (
        <TextInput
          {...control}
          ref={inputRef}
          name={field.name}
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          // No HTML `maxlength`: it would silently stop typing, so a too-long value could never be
          // reported to the person. The rule is checked and explained by validation instead.
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      )}
    </FieldFrame>
  );
}
