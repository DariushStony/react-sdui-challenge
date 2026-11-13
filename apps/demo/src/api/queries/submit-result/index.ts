import { type ServerErrors } from '@dynamic-form/renderer';

/** The same three outcomes the form engine understands (`SubmitOutcome`), minus any UI. */
type SubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly kind: 'validation'; readonly errors: ServerErrors }
  | { readonly ok: false; readonly kind: 'network' };

export type { SubmitResult };
