// @vitest-environment node
import { toFieldErrors } from '../core/field-errors';
import type { FormModel } from '../core/model';
import { FIELD_DEFINITIONS, normalize } from '../fields/definitions';
import { buildValuesSchema } from './build-values-schema';

// The form's whole validation is built from the kinds' own value schemas, keyed by field name. This
// checks that assembly with the real kinds; each rule has its own tests next to its kind.
function modelFrom(fields: object[]): FormModel {
  const result = normalize({ schemaVersion: 2, fields }, 'f');
  if (!result.ok) throw new Error(JSON.stringify(result.issues));
  return result.model;
}

const model = modelFrom([
  { kind: 'text', name: 'brand', label: 'برند', rules: { required: true } },
  { kind: 'number', name: 'year', label: 'سال', rules: { min: 1900 } },
  { kind: 'select', name: 'fuel', label: 'سوخت', options: [{ value: 'gas', label: 'گاز' }] },
]);

describe('buildValuesSchema', () => {
  const schema = buildValuesSchema(model, FIELD_DEFINITIONS);

  it('accepts values that satisfy every field', () => {
    expect(schema.safeParse({ brand: 'پژو', year: '1950', fuel: 'gas' }).success).toBe(true);
  });

  it('reports each failing field under its own name, with its code', () => {
    const result = schema.safeParse({ brand: '', year: '1800', fuel: 'diesel' });
    expect(result.success).toBe(false);
    if (result.success) return;
    const byField = Object.fromEntries(
      ['brand', 'year', 'fuel'].map((name) => [
        name,
        toFieldErrors(result.error.issues.filter((issue) => issue.path[0] === name)).map(
          (e) => e.code,
        ),
      ]),
    );
    expect(byField).toEqual({ brand: ['required'], year: ['too_small'], fuel: ['not_an_option'] });
  });

  it('accepts an empty form', () => {
    const empty = buildValuesSchema(modelFrom([]), FIELD_DEFINITIONS);
    expect(empty.safeParse({}).success).toBe(true);
  });

  it('refuses a field whose kind has no definition instead of skipping its validation', () => {
    expect(() => buildValuesSchema(model, [])).toThrow(/text.*brand|brand.*text/);
  });
});
