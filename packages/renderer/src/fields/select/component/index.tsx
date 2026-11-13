import type { SelectField } from '../../../core/model/select-field';
import { useMessages } from '../../../provider/use-messages';
import { useUiKit } from '../../../provider/use-ui-kit';
import type { FieldComponentProps } from '../../component';
import { FieldFrame } from '../../field-frame/field-frame';

function SelectComponent({
  field,
  id,
  value,
  onChange,
  onBlur,
  errors,
  inputRef,
}: FieldComponentProps<SelectField>) {
  const { Select } = useUiKit();
  const { t } = useMessages();
  const noOptions = field.options.length === 0;
  // A select has no read-only state, so a read-only field is shown disabled with its value.
  const hint = [field.description, noOptions ? t('no_options') : undefined]
    .filter((part) => part !== undefined)
    .join(' ');

  return (
    <FieldFrame field={field} id={id} errors={errors} hint={hint === '' ? undefined : hint}>
      {({ readOnly, disabled, ...control }) => (
        <Select
          {...control}
          ref={inputRef}
          name={field.name}
          disabled={disabled === true || readOnly === true || noOptions}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        >
          <option value="">{t('choose_option')}</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}
    </FieldFrame>
  );
}

export { SelectComponent };
