import type { z } from 'zod';
import type { FieldError } from '../../issues/field-error';
import { toFieldErrors } from '../to-field-errors';

/**
 * Groups zod's flat list of issues by the field they are about (the first segment of the issue's
 * path) and turns each into a message code with its params. The form's resolver and a server that
 * checks a submission with the same rules both use it.
 */
function errorsByField(issues: z.ZodError['issues']): Record<string, FieldError[]> {
  const byField = new Map<string, z.ZodError['issues']>();
  for (const issue of issues) {
    const name = String(issue.path[0] ?? 'root');
    byField.set(name, [...(byField.get(name) ?? []), issue]);
  }
  return Object.fromEntries([...byField].map(([name, list]) => [name, toFieldErrors(list)]));
}

export { errorsByField };
