import { z } from 'zod';
import type { FieldValue } from '../../../core/model/field-value';
import { compilePattern } from '../../../core/pattern';
import type { StringField } from '../string-field';

function stringValueSchema(field: StringField): z.ZodType<FieldValue> {
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

export { stringValueSchema };
