// @vitest-environment node
import { z } from 'zod';
import { toFieldErrors } from './to-field-errors';

// Validation rules report a stable message code (in `message`) and optional params; the Persian text
// is built later from those. Built-in zod messages are English and must never reach the user.
function failureOf(schema: z.ZodType, value: unknown) {
  const result = schema.safeParse(value);
  if (result.success) throw new Error('expected the schema to fail');
  return result.error;
}

describe('toFieldErrors', () => {
  it('reads the code from a custom issue and keeps its params', () => {
    const schema = z.string().superRefine((_value, ctx) => {
      ctx.addIssue({ code: 'custom', message: 'too_short', params: { min: 3 } });
    });
    expect(toFieldErrors(failureOf(schema, 'a').issues)).toEqual([
      { code: 'too_short', params: { min: 3 } },
    ]);
  });

  it('omits params when the issue has none', () => {
    const schema = z.string().superRefine((_value, ctx) => {
      ctx.addIssue({ code: 'custom', message: 'required' });
    });
    const [error] = toFieldErrors(failureOf(schema, '').issues);
    expect(error).toEqual({ code: 'required' });
    expect(error && 'params' in error).toBe(false);
  });

  it('keeps one error per issue, in order', () => {
    const schema = z.array(z.string()).superRefine((_value, ctx) => {
      ctx.addIssue({ code: 'custom', message: 'file_type', params: { file: 'a.exe' } });
      ctx.addIssue({
        code: 'custom',
        message: 'file_too_large',
        params: { file: 'b.png', maxBytes: 10 },
      });
    });
    expect(toFieldErrors(failureOf(schema, []).issues).map((e) => e.code)).toEqual([
      'file_type',
      'file_too_large',
    ]);
  });

  it('drops param values that are not strings or numbers', () => {
    const schema = z.string().superRefine((_value, ctx) => {
      ctx.addIssue({
        code: 'custom',
        message: 'x',
        params: { ok: 1, text: 'a', bad: { nested: true }, flag: true },
      });
    });
    expect(toFieldErrors(failureOf(schema, 'v').issues)[0]?.params).toEqual({ ok: 1, text: 'a' });
  });

  it('maps a built-in zod failure to the generic code, never to its English message', () => {
    expect(toFieldErrors(failureOf(z.string(), 5).issues)).toEqual([{ code: 'invalid' }]);
  });
});
