import type { z } from 'zod';
import { toFieldErrors } from '../core/field-errors';
import type { FieldError } from '../core/issues';

/** Runs a value schema and returns its error codes and params (an empty list when it passes). */
export function errorsFor(schema: z.ZodType, value: unknown): FieldError[] {
  const result = schema.safeParse(value);
  return result.success ? [] : toFieldErrors(result.error.issues);
}

/** Just the codes, for tables where the params are not the point. */
export function codesFor(schema: z.ZodType, value: unknown): string[] {
  return errorsFor(schema, value).map((error) => error.code);
}
