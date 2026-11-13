import type { FieldError as RhfFieldError, Resolver } from 'react-hook-form';
import type { z } from 'zod';
import { toFieldErrors } from '../core/field-errors';
import type { FieldError } from '../core/issues';
import type { FormValues } from '../core/model';

/**
 * A react-hook-form error entry that also carries the coded errors (`detail`). The form only reads
 * `type` and `message`; the field component reads `detail` to show Persian text with its params.
 */
export type CodedError = RhfFieldError & { readonly detail: readonly FieldError[] };

/** The coded errors on a react-hook-form entry; none if the entry did not come from this resolver. */
export function codedErrorsOf(entry: unknown): readonly FieldError[] {
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

/**
 * Validates form values with a zod schema and keeps each error's code and params. The stock zod
 * resolver keeps only `type` and `message`, which would lose "which file" and "what limit"
 * (ADR-0003). Issues are grouped by the field name, the first segment of the issue path.
 */
export function createResolver(schema: z.ZodType): Resolver<FormValues> {
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
