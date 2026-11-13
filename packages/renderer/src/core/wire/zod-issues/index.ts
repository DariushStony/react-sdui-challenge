import type { z } from 'zod';
import type { Issue } from '../../issues/issue';

/** Turns a zod failure into developer-facing issues whose paths are relative to the whole payload. */
function zodIssues(error: z.ZodError, path: string): Issue[] {
  return error.issues.map((issue) => ({
    path:
      path +
      issue.path
        .map((segment) => (typeof segment === 'number' ? `[${segment}]` : `.${String(segment)}`))
        .join(''),
    code: 'invalid_value',
    message: issue.message,
  }));
}

export { zodIssues };
