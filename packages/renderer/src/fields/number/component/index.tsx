import type { NumberField } from '../../../core/model/number-field';
import { useUiKit } from '../../../provider/use-ui-kit';
import type { FieldComponentProps } from '../../component';
import { FieldFrame } from '../../field-frame/field-frame';

// A text input with a numeric keyboard instead of `type="number"`: browsers handle Persian digits
// in a native number input inconsistently, and a text input lets the person type them. The value is
// kept as typed; core/digits.ts reads it when it is validated and sent.
function NumberComponent({
  field,
  id,
  value,
  onChange,
  onBlur,
  errors,
  inputRef,
}: FieldComponentProps<NumberField>) {
  const { TextInput } = useUiKit();
  return (
    <FieldFrame field={field} id={id} errors={errors}>
      {(control) => (
        <TextInput
          {...control}
          ref={inputRef}
          name={field.name}
          type="text"
          inputMode="decimal"
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      )}
    </FieldFrame>
  );
}

export { NumberComponent };
