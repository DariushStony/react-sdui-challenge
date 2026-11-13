import type { TextareaField } from '../../core/model';
import { TextArea } from '../../ui';
import type { FieldComponentProps } from '../component';
import { FieldFrame } from '../field-frame';

export function TextareaComponent({
  field,
  id,
  value,
  onChange,
  onBlur,
  errors,
  inputRef,
}: FieldComponentProps<TextareaField>) {
  return (
    <FieldFrame field={field} id={id} errors={errors}>
      {(control) => (
        <TextArea
          {...control}
          ref={inputRef}
          name={field.name}
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      )}
    </FieldFrame>
  );
}
