// @vitest-environment node
import { legacyCarPayload } from '../mocks/fixtures/legacy-car';
import { v2CarPayload } from '../mocks/fixtures/v2-car';
import type { FieldModel } from '../core/model';
import { normalize } from './definitions';

// The normalizer wired to the real kinds, fed the payloads that matter most: the sample from the
// brief (it must work unchanged) and the v2 example from the API contract.
function modelOf(raw: unknown): {
  fields: readonly FieldModel[];
  warnings: readonly { code: string }[];
} {
  const result = normalize(raw, 'car');
  if (!result.ok)
    throw new Error(`expected a model, got ${result.reason}: ${JSON.stringify(result.issues)}`);
  return { fields: result.model.fields, warnings: result.warnings };
}

// TC-U04
describe('the legacy sample from the brief', () => {
  const { fields, warnings } = modelOf(legacyCarPayload);

  it('gives the eight fields in order with the kinds the sample implies', () => {
    expect(fields.map((f) => [f.name, f.kind])).toEqual([
      ['brand', 'text'],
      ['model', 'text'],
      ['year', 'number'],
      ['fuel_type', 'select'],
      ['color', 'text'],
      ['previous_owners', 'number'],
      ['technical_condition', 'textarea'],
      ['car_images', 'file'],
    ]);
  });

  it('shows labels without the trailing colon', () => {
    const rawLabels = (legacyCarPayload as { fields: { label: string }[] }).fields.map(
      (f) => f.label,
    );
    expect(rawLabels.every((label) => label.endsWith(':'))).toBe(true);
    expect(fields.map((f) => f.label)).toEqual(rawLabels.map((label) => label.slice(0, -1)));
  });

  it('makes every field optional, because the legacy shape cannot say otherwise', () => {
    expect(fields.every((f) => !f.required)).toBe(true);
  });

  it('turns the string bounds into numbers', () => {
    expect(fields.find((f) => f.name === 'year')).toMatchObject({
      rules: { min: 1900, max: 2024 },
    });
    expect(fields.find((f) => f.name === 'previous_owners')).toMatchObject({ rules: { min: 0 } });
  });

  it('keeps the four select options', () => {
    const select = fields.find((f) => f.kind === 'select');
    expect(select?.kind === 'select' && select.options.map((o) => o.value)).toEqual([
      'بنزین',
      'گاز',
      'دیزل',
      'الکتریکی',
    ]);
  });

  it('reads "5MB", the accept list and `multiple` on the file field', () => {
    expect(fields.find((f) => f.kind === 'file')).toMatchObject({
      multiple: true,
      rules: { accept: ['image/*'], maxBytes: 5 * 1024 * 1024 },
    });
  });

  // TC-U06
  it('keeps only size tokens and drops colors, inline styles and spacing', () => {
    expect(fields.find((f) => f.name === 'brand')).toMatchObject({ size: 'large' });
    expect(fields.find((f) => f.name === 'model')).toMatchObject({ size: 'medium' });
    // Field names can be "color" (this form has one), so look at property names, not at the text.
    expect(fields.every((f) => !('color' in f) && !('style' in f) && !('props' in f))).toBe(true);
    const text = JSON.stringify(fields);
    for (const leaked of ['#000000', 'borderRadius', '10px 0', '8px']) {
      expect(text).not.toContain(leaked);
    }
  });

  it('needs no warnings: nothing in the sample is unknown or malformed', () => {
    expect(warnings).toEqual([]);
  });
});

// TC-U05
describe('legacy quirks, through the real kinds', () => {
  const oneField = (field: object) => ({ fields: [{ label: 'X:', name: 'x', ...field }] });

  it('reads a bound that is a numeric string', () => {
    const { fields } = modelOf(oneField({ type: 'input', props: { type: 'number', min: '5' } }));
    expect(fields[0]).toMatchObject({ kind: 'number', rules: { min: 5 } });
  });

  it('refuses a bound that is not numeric, with the path to it', () => {
    const result = normalize(
      oneField({ type: 'input', props: { type: 'number', min: 'abc' } }),
      'car',
    );
    expect(!result.ok && result.reason).toBe('invalid');
    expect(!result.ok && result.issues.map((i) => i.path)).toEqual(['fields[0].props.min']);
  });

  it('reads an input type it does not support as text, with a warning', () => {
    const { fields, warnings } = modelOf(oneField({ type: 'input', props: { type: 'email' } }));
    expect(fields[0]?.kind).toBe('text');
    expect(warnings.map((w) => w.code)).toEqual(['unsupported_input_type']);
  });

  it('reads an input with no props.type as text', () => {
    expect(modelOf(oneField({ type: 'input' })).fields[0]?.kind).toBe('text');
  });

  it('makes a file field single when `multiple` is absent', () => {
    expect(modelOf(oneField({ type: 'file', props: {} })).fields[0]).toMatchObject({
      multiple: false,
    });
  });

  it('skips a field of a type nobody supports, with a warning', () => {
    const { fields, warnings } = modelOf({
      fields: [
        { label: 'R:', name: 'stars', type: 'rating' },
        { label: 'X:', name: 'x', type: 'input' },
      ],
    });
    expect(fields.map((f) => f.name)).toEqual(['x']);
    expect(warnings.map((w) => w.code)).toEqual(['unknown_kind']);
  });
});

// TC-U07, TC-U09
describe('the v2 example from the API contract', () => {
  const { fields, warnings } = modelOf(v2CarPayload);

  it('gives the five fields with their rules', () => {
    expect(fields.map((f) => [f.name, f.kind, f.required])).toEqual([
      ['brand', 'text', true],
      ['year', 'number', true],
      ['fuel_type', 'select', true],
      ['technical_condition', 'textarea', false],
      ['car_images', 'file', false],
    ]);
    expect(fields[0]).toMatchObject({
      rules: { maxLength: 40 },
      placeholder: 'برند ماشین را وارد کنید',
    });
    expect(fields[1]).toMatchObject({ rules: { min: 1900, max: 2024, integer: true } });
    expect(fields[3]).toMatchObject({ description: 'حداکثر ۵۰۰ نویسه', rules: { maxLength: 500 } });
    expect(fields[4]).toMatchObject({
      multiple: true,
      rules: { accept: ['image/*'], maxBytes: 5242880, maxFiles: 5 },
    });
  });

  it('needs no warnings', () => {
    expect(warnings).toEqual([]);
  });

  it('skips an unknown optional kind and refuses an unknown required one', () => {
    const optional = normalize(
      { schemaVersion: 2, fields: [{ kind: 'rating', name: 'stars', label: 'S' }] },
      'f',
    );
    expect(optional.ok && optional.model.fields).toEqual([]);

    const required = normalize(
      {
        schemaVersion: 2,
        fields: [{ kind: 'rating', name: 'stars', label: 'S', rules: { required: true } }],
      },
      'f',
    );
    expect(!required.ok && required.reason).toBe('unknown-required-kind');
  });

  it('refuses a payload whose version is newer than this client', () => {
    const result = normalize({ schemaVersion: 3, fields: [] }, 'f');
    expect(!result.ok && result.reason).toBe('outdated');
  });
});
