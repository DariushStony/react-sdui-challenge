import type { FieldValue } from '../../../core/model/field-value';
import type { StringField } from '../string-field';

function appendString(field: StringField, value: FieldValue, body: FormData): void {
  body.append(field.name, typeof value === 'string' ? value.trim() : '');
}

export { appendString };
