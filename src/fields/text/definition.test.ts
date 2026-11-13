// @vitest-environment node
import type { TextField } from '../../core/model';
import { codesFor, errorsFor } from '../../test/rules';
import { textDefinition } from './definition';

const field = (overrides: Partial<TextField> = {}): TextField => ({
  kind: 'text',
  name: 'brand',
  label: 'برند',
  required: false,
  rules: {},
  ...overrides,
});

describe('text kind: reading', () => {
  it.each([
    ['input with props.type text', { type: 'input', props: { type: 'text' } }],
    ['input without props.type', { type: 'input', props: {} }],
    ['input without props', { type: 'input' }],
  ])('claims a legacy %s', (_name, extra) => {
    const result = textDefinition.fromLegacy?.(
      { name: 'brand', label: 'برند:', ...extra },
      'fields[0]',
    );
    expect(result).toMatchObject({
      ok: true,
      field: { kind: 'text', name: 'brand', label: 'برند', required: false, rules: {} },
      warnings: [],
    });
  });

  it('does not claim a legacy number input, a select or an unknown type', () => {
    const base = { name: 'a', label: 'A' };
    expect(
      textDefinition.fromLegacy?.({ ...base, type: 'input', props: { type: 'number' } }, 'p'),
    ).toBe('not-mine');
    expect(textDefinition.fromLegacy?.({ ...base, type: 'select' }, 'p')).toBe('not-mine');
    expect(textDefinition.fromLegacy?.({ ...base, type: 'banana' }, 'p')).toBe('not-mine');
  });

  it('reads an input type it does not support as text, with a warning', () => {
    const result = textDefinition.fromLegacy?.(
      { type: 'input', name: 'mail', label: 'ایمیل', props: { type: 'email' } },
      'fields[1]',
    );
    expect(result).toMatchObject({ ok: true, field: { kind: 'text' } });
    expect(result !== 'not-mine' && result?.ok && result.warnings.map((w) => w.code)).toEqual([
      'unsupported_input_type',
    ]);
  });

  it('keeps legacy placeholder and size, and drops presentation data', () => {
    const result = textDefinition.fromLegacy?.(
      {
        type: 'input',
        name: 'brand',
        label: 'برند:',
        props: { placeholder: 'برند', size: 'large', color: '#000' },
        style: { margin: '1px' },
      },
      'p',
    );
    expect(result !== 'not-mine' && result?.ok && result.field).toEqual({
      kind: 'text',
      name: 'brand',
      label: 'برند',
      required: false,
      placeholder: 'برند',
      size: 'large',
      rules: {},
    });
  });

  it('reports a legacy field with no name instead of guessing', () => {
    const result = textDefinition.fromLegacy?.({ type: 'input', label: 'A' }, 'fields[4]');
    expect(result !== 'not-mine' && result?.ok).toBe(false);
  });

  it('reads a v2 field with its rules', () => {
    const result = textDefinition.fromV2(
      {
        kind: 'text',
        name: 'brand',
        label: 'برند',
        rules: { required: true, minLength: 2, maxLength: 40, pattern: '[A-Z]+' },
      },
      'fields[0]',
    );
    expect(result).toEqual({
      ok: true,
      warnings: [],
      field: {
        kind: 'text',
        name: 'brand',
        label: 'برند',
        required: true,
        rules: { minLength: 2, maxLength: 40, pattern: '[A-Z]+' },
      },
    });
  });

  it('drops a pattern that does not compile and says so', () => {
    const result = textDefinition.fromV2(
      { kind: 'text', name: 'a', label: 'A', rules: { pattern: '(' } },
      'fields[0]',
    );
    expect(result.ok && 'rules' in result.field && result.field.rules).toEqual({});
    expect(result.ok && result.warnings.map((w) => [w.path, w.code])).toEqual([
      ['fields[0].rules.pattern', 'invalid_pattern'],
    ]);
  });

  it('rejects a v2 rule of the wrong type', () => {
    const result = textDefinition.fromV2(
      { kind: 'text', name: 'a', label: 'A', rules: { minLength: 'two' } },
      'fields[0]',
    );
    expect(result.ok).toBe(false);
  });
});

// TC-U13
describe('text kind: validation', () => {
  it.each([
    ['empty and required', field({ required: true }), '', ['required']],
    ['only spaces and required', field({ required: true }), '   ', ['required']],
    ['empty and optional', field(), '', []],
    ['empty and optional even with a minimum', field({ rules: { minLength: 3 } }), '', []],
    ['one under the minimum', field({ rules: { minLength: 3 } }), 'ab', ['too_short']],
    ['exactly the minimum', field({ rules: { minLength: 3 } }), 'abc', []],
    ['exactly the maximum', field({ rules: { maxLength: 3 } }), 'abc', []],
    ['one over the maximum', field({ rules: { maxLength: 3 } }), 'abcd', ['too_long']],
    ['spaces around the value do not count', field({ rules: { maxLength: 3 } }), '  abc  ', []],
    ['Persian letters count as one character each', field({ rules: { maxLength: 4 } }), 'سلام', []],
    ['pattern that matches', field({ rules: { pattern: '[A-Z]{2}' } }), 'AB', []],
    [
      'pattern that does not match',
      field({ rules: { pattern: '[A-Z]{2}' } }),
      'ABC',
      ['pattern_mismatch'],
    ],
    [
      'a pattern that cannot compile is ignored',
      field({ rules: { pattern: '(' } }),
      'anything',
      [],
    ],
  ])('%s', (_name, f, value, codes) => {
    expect(codesFor(textDefinition.valueSchema(f), value)).toEqual(codes);
  });

  it('puts the limit in the params so the message can show it', () => {
    expect(errorsFor(textDefinition.valueSchema(field({ rules: { minLength: 3 } })), 'a')).toEqual([
      { code: 'too_short', params: { min: 3 } },
    ]);
    expect(
      errorsFor(textDefinition.valueSchema(field({ rules: { maxLength: 3 } })), 'abcd'),
    ).toEqual([{ code: 'too_long', params: { max: 3 } }]);
  });
});

describe('text kind: value and encoding', () => {
  it('starts empty, or at the default value', () => {
    expect(textDefinition.defaultValue(field())).toBe('');
    expect(textDefinition.defaultValue(field({ defaultValue: 'پژو' }))).toBe('پژو');
  });

  it('sends the trimmed text under the field name', () => {
    const body = new FormData();
    textDefinition.appendTo(field(), '  پژو ', body);
    expect([...body.entries()]).toEqual([['brand', 'پژو']]);
  });

  it('sends an empty string for an empty field', () => {
    const body = new FormData();
    textDefinition.appendTo(field(), '', body);
    expect(body.get('brand')).toBe('');
  });
});
