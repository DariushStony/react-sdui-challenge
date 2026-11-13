import type { z } from 'zod';
import type { FieldError } from './issues';

export function primitiveParams(
  raw: Record<string, unknown> | undefined,
): Record<string, string | number> | undefined {
  if (raw === undefined) return undefined;
  const entries = Object.entries(raw).filter(
    (entry): entry is [string, string | number] =>
      typeof entry[1] === 'string' || typeof entry[1] === 'number',
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/**
 * Validation rules report a stable message code in `message` and values in `params`. This turns a
 * zod failure into those codes. A built-in zod issue has an English message that must never reach
 * the user, so it becomes the generic code `invalid`.
 */
export function toFieldErrors(issues: z.ZodError['issues']): FieldError[] {
  return issues.map((issue): FieldError => {
    if (issue.code !== 'custom') return { code: 'invalid' };
    const params = primitiveParams(issue.params);
    return params ? { code: issue.message, params } : { code: issue.message };
  });
}
