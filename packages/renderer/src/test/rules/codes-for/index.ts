import type { z } from 'zod';
import { errorsFor } from '../errors-for';

/** Just the codes, for tables where the params are not the point. */
function codesFor(schema: z.ZodType, value: unknown): string[] {
  return errorsFor(schema, value).map((error) => error.code);
}

export { codesFor };
