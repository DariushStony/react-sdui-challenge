import type { z } from 'zod';
import type { FieldError } from '../../issues/field-error';
import { primitiveParams } from '../primitive-params';

/**
 * Validation rules report a stable message code in `message` and values in `params`. This turns a
 * zod failure into those codes. A built-in zod issue has an English message that must never reach
 * the user, so it becomes the generic code `invalid`.
 */
function toFieldErrors(issues: z.ZodError['issues']): FieldError[] {
  return issues.map((issue): FieldError => {
    if (issue.code !== 'custom') return { code: 'invalid' };
    const params = primitiveParams(issue.params);
    return params ? { code: issue.message, params } : { code: issue.message };
  });
}

export { toFieldErrors };
