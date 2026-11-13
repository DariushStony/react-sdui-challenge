import { z } from 'zod';
import { primitiveParams } from '../field-errors/primitive-params';
import type { FieldError } from '../issues/field-error';
import type { ServerErrors } from '../issues/server-errors';

const errorItem = z.object({
  code: z.string(),
  params: z.record(z.string(), z.unknown()).optional(),
  message: z.string().optional(),
});

const body = z.object({
  errors: z.record(z.string(), z.array(errorItem)).optional(),
  formErrors: z.array(errorItem).optional(),
});

function toFieldError(item: z.output<typeof errorItem>): FieldError {
  const params = primitiveParams(item.params);
  return {
    code: item.code,
    ...(params ? { params } : {}),
    ...(item.message !== undefined ? { message: item.message } : {}),
  };
}

/**
 * Reads the body of a `422` response (docs/api-contract.md, section 4.3). Errors for a field the form
 * does not have are moved to the form-level list, so the person still sees them. A body that does not
 * have the expected shape returns null, and the caller treats it as a generic failure.
 */
function parseServerErrors(raw: unknown, knownFields: readonly string[]): ServerErrors | null {
  const parsed = body.safeParse(raw);
  if (!parsed.success) return null;

  const fields: Record<string, FieldError[]> = {};
  const form: FieldError[] = (parsed.data.formErrors ?? []).map(toFieldError);
  for (const [name, list] of Object.entries(parsed.data.errors ?? {})) {
    // An empty list says nothing: no text to show, and nothing to focus.
    if (list.length === 0) continue;
    const errors = list.map(toFieldError);
    if (knownFields.includes(name)) fields[name] = errors;
    else form.push(...errors);
  }
  return { fields, form };
}

export { parseServerErrors };
