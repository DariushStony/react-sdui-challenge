import type { FormModel } from '../../model/form-model';
import type { Issue } from '../issue';
import type { RejectionReason } from '../rejection-reason';

type ParseResult =
  | { readonly ok: true; readonly model: FormModel; readonly warnings: readonly Issue[] }
  | { readonly ok: false; readonly reason: RejectionReason; readonly issues: readonly Issue[] };

export type { ParseResult };
