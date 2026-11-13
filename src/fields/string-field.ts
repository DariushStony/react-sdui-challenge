import { z } from 'zod';
import type { Issue } from '../core/issues';
import type { FieldValue, TextareaField, TextField } from '../core/model';
import { compilePattern } from '../core/pattern';
import { readV2, type V2Base } from '../core/v2';
import { omitUndefined, type Raw } from '../core/wire';

// `text` and `textarea` differ only in the control; reading, rules and encoding are identical, so
// they share this module instead of repeating it.
type StringField = TextField | TextareaField;

const stringRules = z.object({
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(0).optional(),
  pattern: z.string().optional(),
});

export type StringV2 =
  | {
      readonly ok: true;
      readonly base: V2Base;
      readonly rules: StringField['rules'];
      readonly warnings: readonly Issue[];
    }
  | { readonly ok: false; readonly issues: readonly Issue[] };

export function readStringV2(raw: Raw, path: string): StringV2 {
  const read = readV2(raw, path, stringRules);
  if (!read.ok) return read;

  const { pattern, ...lengths } = read.rules;
  const warnings = [...read.warnings];
  // A pattern that cannot compile is dropped here so it never reaches rendering (NFR-08).
  const usablePattern =
    pattern !== undefined && compilePattern(pattern) === null ? undefined : pattern;
  if (pattern !== undefined && usablePattern === undefined) {
    warnings.push({
      path: `${path}.rules.pattern`,
      code: 'invalid_pattern',
      message: `Ignored a pattern that does not compile: ${pattern}`,
    });
  }
  return {
    ok: true,
    base: read.base,
    rules: omitUndefined({ ...lengths, pattern: usablePattern }),
    warnings,
  };
}

export function stringValueSchema(field: StringField): z.ZodType<FieldValue> {
  const pattern = field.rules.pattern === undefined ? null : compilePattern(field.rules.pattern);
  return z.string().superRefine((raw, ctx) => {
    const value = raw.trim();
    if (value === '') {
      if (field.required) ctx.addIssue({ code: 'custom', message: 'required' });
      return;
    }
    // Count characters, not UTF-16 units, so a limit means what a person sees.
    const length = Array.from(value).length;
    const { minLength, maxLength } = field.rules;
    if (minLength !== undefined && length < minLength) {
      ctx.addIssue({ code: 'custom', message: 'too_short', params: { min: minLength } });
    }
    if (maxLength !== undefined && length > maxLength) {
      ctx.addIssue({ code: 'custom', message: 'too_long', params: { max: maxLength } });
    }
    if (pattern !== null && !pattern.test(value)) {
      ctx.addIssue({ code: 'custom', message: 'pattern_mismatch' });
    }
  });
}

export function stringDefault(field: StringField): FieldValue {
  return field.defaultValue ?? '';
}

export function appendString(field: StringField, value: FieldValue, body: FormData): void {
  body.append(field.name, typeof value === 'string' ? value.trim() : '');
}
