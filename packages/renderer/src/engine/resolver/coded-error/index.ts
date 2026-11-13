import type { FieldError as RhfFieldError } from 'react-hook-form';
import type { FieldError } from '../../../core/issues/field-error';

/**
 * A react-hook-form error entry that also carries the coded errors (`detail`). The form only reads
 * `type` and `message`; the field component reads `detail` to show Persian text with its params.
 */
type CodedError = RhfFieldError & { readonly detail: readonly FieldError[] };

export type { CodedError };
