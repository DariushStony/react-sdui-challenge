import type { FieldBase } from '../field-base';
import type { StringRules } from '../string-rules';

type TextField = FieldBase & {
  readonly kind: 'text';
  readonly defaultValue?: string;
  readonly rules: StringRules;
};

export type { TextField };
