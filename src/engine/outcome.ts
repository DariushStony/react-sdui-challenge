import type { ReactNode } from 'react';
import type { ServerErrors } from '../core/issues';

/**
 * What the owner of a form reports back after trying to submit. The engine has no network code
 * (TDD 6.3): the page that owns it sends the request and turns the answer into one of these.
 */
export type SubmitOutcome =
  | { readonly ok: true; readonly summary?: ReactNode }
  | { readonly ok: false; readonly kind: 'validation'; readonly errors: ServerErrors }
  | { readonly ok: false; readonly kind: 'network' };
