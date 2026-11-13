import type { Issue } from '../../issues/issue';
import type { FieldModel } from '../../model/field-model';

type FieldParse<F extends FieldModel> =
  | { readonly ok: true; readonly field: F; readonly warnings: readonly Issue[] }
  | { readonly ok: false; readonly issues: readonly Issue[] };

export type { FieldParse };
