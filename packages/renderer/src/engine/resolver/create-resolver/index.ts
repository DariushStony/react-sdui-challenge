import type { Resolver } from 'react-hook-form';
import type { z } from 'zod';
import { toFieldErrors } from '../../../core/field-errors/to-field-errors';
import type { FormValues } from '../../../core/model/form-values';
import type { CodedError } from '../coded-error';

/**
 * Validates form values with a zod schema and keeps each error's code and params. The stock zod
 * resolver keeps only `type` and `message`, which would lose "which file" and "what limit"
 * (ADR-0003). Issues are grouped by the field name, the first segment of the issue path.
 */
function createResolver(schema: z.ZodType): Resolver<FormValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values, errors: {} };

    const issuesByField = new Map<string, z.ZodError['issues']>();
    for (const issue of result.error.issues) {
      const name = String(issue.path[0] ?? 'root');
      issuesByField.set(name, [...(issuesByField.get(name) ?? []), issue]);
    }

    const errors: Record<string, CodedError> = {};
    for (const [name, issues] of issuesByField) {
      const detail = toFieldErrors(issues);
      const first = detail[0]?.code ?? 'invalid';
      errors[name] = { type: first, message: first, detail };
    }
    return { values: {}, errors };
  };
}

export { createResolver };
