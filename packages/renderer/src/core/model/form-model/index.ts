import type { FieldModel } from '../field-model';

type FormModel = {
  readonly formId: string;
  /** 1 means the legacy payload shape. */
  readonly schemaVersion: 1 | 2;
  readonly title?: string;
  readonly fields: readonly FieldModel[];
};

export type { FormModel };
