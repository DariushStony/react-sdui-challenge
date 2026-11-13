import type { FieldBase } from '../field-base';

type FileField = FieldBase & {
  readonly kind: 'file';
  readonly multiple: boolean;
  readonly rules: {
    readonly accept?: readonly string[];
    readonly maxBytes?: number;
    readonly maxFiles?: number;
  };
};

export type { FileField };
