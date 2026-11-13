// @vitest-environment node
import { z } from 'zod';
import { errorsByField } from '.';

// Both the form (through its resolver) and a server that checks a submission need the same step:
// turn zod's flat list of issues into message codes per field.
const schema = z.object({
  brand: z.string().superRefine((value, ctx) => {
    if (value.length < 2)
      ctx.addIssue({ code: 'custom', message: 'too_short', params: { min: 2 } });
    if (value === 'bad') ctx.addIssue({ code: 'custom', message: 'not_an_option' });
  }),
  year: z
    .string()
    .superRefine((_value, ctx) => ctx.addIssue({ code: 'custom', message: 'required' })),
});

const issuesOf = (value: unknown) => {
  const result = schema.safeParse(value);
  return result.success ? [] : result.error.issues;
};

describe('errorsByField', () => {
  it('groups the issues by the field they are about, as message codes with their params', () => {
    expect(errorsByField(issuesOf({ brand: 'x', year: '1' }))).toEqual({
      brand: [{ code: 'too_short', params: { min: 2 } }],
      year: [{ code: 'required' }],
    });
  });

  it('keeps every issue of one field, in order', () => {
    const issues = schema
      .safeParse({ brand: 'b', year: '1' })
      .error!.issues.filter((issue) => issue.path[0] === 'brand');
    expect(errorsByField([...issues, ...issues]).brand).toHaveLength(2);
  });

  it('turns an issue that is not one of ours into the generic code, never its English message', () => {
    const issues = z.object({ a: z.string() }).safeParse({ a: 1 }).error!.issues;
    expect(errorsByField(issues)).toEqual({ a: [{ code: 'invalid' }] });
  });

  it('files an issue with no path under "root"', () => {
    const issues = z
      .string()
      .superRefine((_v, ctx) => ctx.addIssue({ code: 'custom', message: 'invalid' }))
      .safeParse('x').error!.issues;
    expect(errorsByField(issues)).toEqual({ root: [{ code: 'invalid' }] });
  });

  it('has nothing to say when there are no issues', () => {
    expect(errorsByField([])).toEqual({});
  });
});
