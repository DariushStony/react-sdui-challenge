import { z } from 'zod';
import type { Issue } from './issues';
import type { FieldSize } from './model';
import {
  isRecord,
  isSafeFieldName,
  omitUndefined,
  sizeToken,
  unknownKeyWarnings,
  zodIssues,
  type Raw,
} from './wire';

const BASE = z.object({
  name: z
    .string()
    .refine(isSafeFieldName, { message: 'name must be text without ".", "[" or "]"' }),
  label: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  disabled: z.boolean().optional(),
  readOnly: z.boolean().optional(),
  // Read as text so an unknown value can be ignored with a warning instead of failing the field.
  size: z.string().optional(),
});

// `kind` and `rules` are read by their own code below.
const BASE_KEYS = [...Object.keys(BASE.shape), 'kind', 'rules'];

export type V2Base = {
  readonly name: string;
  readonly label: string;
  readonly required: boolean;
  readonly description?: string;
  readonly placeholder?: string;
  readonly defaultValue?: string;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly size?: FieldSize;
};

export type V2Read<Rules> =
  | {
      readonly ok: true;
      readonly base: V2Base;
      readonly rules: Rules;
      readonly warnings: readonly Issue[];
    }
  | { readonly ok: false; readonly issues: readonly Issue[] };

/**
 * Reads a v2 field: the common properties, `rules.required`, and the rules the kind declares in
 * `ruleSchema` (without `required`). Unknown keys never fail a field; they are reported as warnings
 * so a newer server can add things without breaking an older client (ADR-0011). `extraKeys` are the
 * top-level keys the kind reads on its own (for example `options`), so they are not reported.
 */
export function readV2<S extends z.ZodObject>(
  raw: Raw,
  path: string,
  ruleSchema: S,
  extraKeys: readonly string[] = [],
): V2Read<z.output<S>> {
  const issues: Issue[] = [];

  const base = BASE.safeParse(raw);
  if (!base.success) issues.push(...zodIssues(base.error, path));

  const rawRules = raw['rules'];
  const rules = rawRules === undefined ? {} : isRecord(rawRules) ? rawRules : undefined;
  if (rules === undefined) {
    issues.push({
      path: `${path}.rules`,
      code: 'invalid_value',
      message: 'rules must be an object',
    });
  }

  const requiredRule = rules?.['required'];
  if (requiredRule !== undefined && typeof requiredRule !== 'boolean') {
    issues.push({
      path: `${path}.rules.required`,
      code: 'invalid_value',
      message: 'required must be a boolean',
    });
  }

  const { required: _required, ...kindRules } = rules ?? {};
  const parsedRules = ruleSchema.safeParse(kindRules);
  if (!parsedRules.success) issues.push(...zodIssues(parsedRules.error, `${path}.rules`));

  if (!base.success || rules === undefined || !parsedRules.success || issues.length > 0) {
    return { ok: false, issues };
  }

  const warnings = [
    ...unknownKeyWarnings(raw, [...BASE_KEYS, ...extraKeys], path),
    ...unknownKeyWarnings(rules, [...Object.keys(ruleSchema.shape), 'required'], `${path}.rules`),
  ];
  const size = sizeToken(base.data.size);
  if (base.data.size !== undefined && size === undefined) {
    warnings.push({
      path: `${path}.size`,
      code: 'unknown_size',
      message: `Ignored unknown size "${base.data.size}"`,
    });
  }

  const { size: _size, ...common } = base.data;
  return {
    ok: true,
    base: { ...omitUndefined(common), required: requiredRule === true, ...omitUndefined({ size }) },
    rules: parsedRules.data,
    warnings,
  };
}
