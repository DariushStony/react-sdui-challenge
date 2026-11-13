import type { FieldError } from '../../../core/issues/field-error';

/** The coded errors on a react-hook-form entry; none if the entry did not come from this resolver. */
function codedErrorsOf(entry: unknown): readonly FieldError[] {
  if (
    typeof entry === 'object' &&
    entry !== null &&
    'detail' in entry &&
    Array.isArray(entry.detail)
  ) {
    return entry.detail as readonly FieldError[];
  }
  return [];
}

export { codedErrorsOf };
