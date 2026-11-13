import type { z } from 'zod';
import { toFieldErrors } from '../../../core/field-errors/to-field-errors';
import type { FieldError } from '../../../core/issues/field-error';

/** Runs a value schema and returns its error codes and params (an empty list when it passes). */
function errorsFor(schema: z.ZodType, value: unknown): FieldError[] {
  const result = schema.safeParse(value);
  return result.success ? [] : toFieldErrors(result.error.issues);
}

export { errorsFor };
