import type { FieldBase } from '../field-base';

type NumberField = FieldBase & {
  readonly kind: 'number';
  readonly defaultValue?: string;
  readonly rules: {
    readonly min?: number;
    readonly max?: number;
    readonly integer?: boolean;
  };
};

export type { NumberField };
