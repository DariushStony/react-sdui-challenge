import type { FieldSize } from '../../model/field-size';

type LegacyBase = {
  readonly name: string;
  readonly label: string;
  readonly required: boolean;
  readonly placeholder?: string;
  readonly size?: FieldSize;
};

export type { LegacyBase };
