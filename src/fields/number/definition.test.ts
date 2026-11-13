// @vitest-environment node
import type { NumberField } from '../../core/model';
import { codesFor, errorsFor } from '../../test/rules';
import { numberDefinition } from './definition';

const field = (overrides: Partial<NumberField> = {}): NumberField => ({
  kind: 'number',
  name: 'year',
  label: 'سال ساخت',
  required: false,
  rules: {},
  ...overrides,
});

describe('number kind: reading', () => {
  it('claims a legacy number input and turns string bounds into numbers', () => {
    const result = numberDefinition.fromLegacy?.(
      {
        type: 'input',
        name: 'year',
        label: 'سال ساخت:',
        props: { type: 'number', min: '1900', max: '2024', placeholder: 'سال', color: '#000' },
        style: { margin: '10px 0' },
      },
      'fields[2]',
    );
    expect(result !== 'not-mine' && result?.ok && result.field).toEqual({
      kind: 'number',
      name: 'year',
      label: 'سال ساخت',
      required: false,
      placeholder: 'سال',
      rules: { min: 1900, max: 2024 },
    });
  });

  it('accepts bounds that are already numbers and bounds that are absent', () => {
    const base = { type: 'input', name: 'n', label: 'N' };
    const withNumbers = numberDefinition.fromLegacy?.(
      { ...base, props: { type: 'number', min: 0 } },
      'p',
    );
    expect(withNumbers !== 'not-mine' && withNumbers?.ok && withNumbers.field).toMatchObject({
      rules: { min: 0 },
    });
    const without = numberDefinition.fromLegacy?.({ ...base, props: { type: 'number' } }, 'p');
    expect(without !== 'not-mine' && without?.ok && without.field).toMatchObject({ rules: {} });
  });

  it('rejects a bound that is not a number, naming it', () => {
    const result = numberDefinition.fromLegacy?.(
      { type: 'input', name: 'n', label: 'N', props: { type: 'number', min: 'abc' } },
      'fields[3]',
    );
    expect(
      result !== 'not-mine' && result?.ok === false && result.issues.map((i) => i.path),
    ).toEqual(['fields[3].props.min']);
  });

  it('does not claim a text input or another type', () => {
    const base = { name: 'n', label: 'N' };
    expect(
      numberDefinition.fromLegacy?.({ ...base, type: 'input', props: { type: 'text' } }, 'p'),
    ).toBe('not-mine');
    expect(numberDefinition.fromLegacy?.({ ...base, type: 'input' }, 'p')).toBe('not-mine');
    expect(numberDefinition.fromLegacy?.({ ...base, type: 'select' }, 'p')).toBe('not-mine');
  });

  it('reads a v2 number with its rules', () => {
    const result = numberDefinition.fromV2(
      {
        kind: 'number',
        name: 'year',
        label: 'سال',
        rules: { required: true, min: 1900, max: 2024, integer: true },
      },
      'fields[0]',
    );
    expect(result.ok && result.field).toEqual({
      kind: 'number',
      name: 'year',
      label: 'سال',
      required: true,
      rules: { min: 1900, max: 2024, integer: true },
    });
  });

  it('rejects a v2 bound that is not a number', () => {
    const result = numberDefinition.fromV2(
      { kind: 'number', name: 'n', label: 'N', rules: { min: '1' } },
      'fields[0]',
    );
    expect(result.ok).toBe(false);
  });
});

// TC-U14
describe('number kind: validation', () => {
  it.each([
    ['empty and required', field({ required: true }), '', ['required']],
    ['empty and optional', field(), '', []],
    ['letters', field(), 'abc', ['not_a_number']],
    ['two dots', field(), '1.2.3', ['not_a_number']],
    ['a decimal with no rule against it', field(), '12.5', []],
    ['a negative with no rule against it', field(), '-3', []],
    [
      'a decimal when integers are required',
      field({ rules: { integer: true } }),
      '12.5',
      ['not_an_integer'],
    ],
    ['a whole number when integers are required', field({ rules: { integer: true } }), '12', []],
    ['one under the minimum', field({ rules: { min: 1900 } }), '1899', ['too_small']],
    ['exactly the minimum', field({ rules: { min: 1900 } }), '1900', []],
    ['exactly the maximum', field({ rules: { max: 2024 } }), '2024', []],
    ['one over the maximum', field({ rules: { max: 2024 } }), '2025', ['too_big']],
    [
      'Persian digits are read before checking',
      field({ rules: { min: 1900, max: 2024 } }),
      '۱۳۹۸',
      ['too_small'],
    ],
    ['Persian digits inside the range', field({ rules: { min: 1900, max: 2024 } }), '۲۰۲۰', []],
    ['letters win over the range', field({ rules: { min: 1 } }), 'x', ['not_a_number']],
  ])('%s', (_name, f, value, codes) => {
    expect(codesFor(numberDefinition.valueSchema(f), value)).toEqual(codes);
  });

  it('puts the bound in the params', () => {
    expect(errorsFor(numberDefinition.valueSchema(field({ rules: { min: 5 } })), '1')).toEqual([
      { code: 'too_small', params: { min: 5 } },
    ]);
    expect(errorsFor(numberDefinition.valueSchema(field({ rules: { max: 5 } })), '9')).toEqual([
      { code: 'too_big', params: { max: 5 } },
    ]);
  });
});

describe('number kind: value and encoding', () => {
  it('starts empty, or at the default value', () => {
    expect(numberDefinition.defaultValue(field())).toBe('');
    expect(numberDefinition.defaultValue(field({ defaultValue: '1400' }))).toBe('1400');
  });

  it('sends the number as ASCII digits whatever the person typed', () => {
    const body = new FormData();
    numberDefinition.appendTo(field(), ' ۱۳۹۸ ', body);
    expect(body.get('year')).toBe('1398');
  });

  it('sends an empty string for an empty field', () => {
    const body = new FormData();
    numberDefinition.appendTo(field(), '', body);
    expect(body.get('year')).toBe('');
  });
});
