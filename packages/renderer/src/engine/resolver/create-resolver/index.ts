import type { Resolver } from 'react-hook-form';
import type { z } from 'zod';
import { errorsByField } from '../../../core/field-errors/errors-by-field';
import type { FormValues } from '../../../core/model/form-values';
import type { CodedError } from '../coded-error';

/**
 * Validates form values with a zod schema and keeps each error's code and params. The stock zod
 * resolver keeps only `type` and `message`, which would lose "which file" and "what limit"
 * (ADR-0003). Issues are grouped by field (`errorsByField`).
 */
function createResolver(schema: z.ZodType): Resolver<FormValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values, errors: {} };

    const errors: Record<string, CodedError> = {};
    for (const [name, detail] of Object.entries(errorsByField(result.error.issues))) {
      const first = detail[0]?.code ?? 'invalid';
      errors[name] = { type: first, message: first, detail };
    }
    return { values: {}, errors };
  };
}

export { createResolver };
