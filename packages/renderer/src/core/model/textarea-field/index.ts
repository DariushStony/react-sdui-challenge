import type { FieldBase } from '../field-base';
import type { StringRules } from '../string-rules';

type TextareaField = FieldBase & {
  readonly kind: 'textarea';
  readonly defaultValue?: string;
  readonly rules: StringRules;
};

export type { TextareaField };
