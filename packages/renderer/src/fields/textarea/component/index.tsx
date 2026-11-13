import type { TextareaField } from '../../../core/model/textarea-field';
import { useUiKit } from '../../../provider/use-ui-kit';
import type { FieldComponentProps } from '../../component';
import { FieldFrame } from '../../field-frame/field-frame';

function TextareaComponent({
  field,
  id,
  value,
  onChange,
  onBlur,
  errors,
  inputRef,
}: FieldComponentProps<TextareaField>) {
  const { TextArea } = useUiKit();
  return (
    <FieldFrame field={field} id={id} errors={errors}>
      {(control) => (
        <TextArea
          {...control}
          ref={inputRef}
          name={field.name}
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          // No HTML `maxlength` here either: validation explains a too-long value instead of dropping keys.
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      )}
    </FieldFrame>
  );
}

export { TextareaComponent };
