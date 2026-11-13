import type { FieldValue } from '../../../core/model/field-value';
import type { StringField } from '../string-field';

function stringDefault(field: StringField): FieldValue {
  return field.defaultValue ?? '';
}

export { stringDefault };
