import type { FieldSize } from '../../model/field-size';

type V2Base = {
  readonly name: string;
  readonly label: string;
  readonly required: boolean;
  readonly description?: string;
  readonly placeholder?: string;
  readonly defaultValue?: string;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly size?: FieldSize;
};

export type { V2Base };
