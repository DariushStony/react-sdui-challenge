import type { FieldBase } from '../field-base';

type SelectField = FieldBase & {
  readonly kind: 'select';
  readonly defaultValue?: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
};

export type { SelectField };
