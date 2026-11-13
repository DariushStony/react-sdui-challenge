// @vitest-environment node
import type { SelectField } from '../../core/model';
import { codesFor } from '../../test/rules';
import { selectDefinition } from './definition';

const options = [
  { value: 'petrol', label: 'بنزین' },
  { value: 'gas', label: 'گاز' },
];

const field = (overrides: Partial<SelectField> = {}): SelectField => ({
  kind: 'select',
  name: 'fuel_type',
  label: 'نوع سوخت',
  required: false,
  options,
  ...overrides,
});

describe('select kind: reading', () => {
  it('claims a legacy select and keeps its options', () => {
    const result = selectDefinition.fromLegacy?.(
      {
        type: 'select',
        name: 'fuel_type',
        label: 'نوع سوخت:',
        props: {
          options: [
            { label: 'بنزین', value: 'بنزین' },
            { label: 'گاز', value: 'گاز' },
          ],
        },
        style: { padding: '8px' },
      },
      'fields[3]',
    );
    expect(result !== 'not-mine' && result?.ok && result.field).toEqual({
      kind: 'select',
      name: 'fuel_type',
      label: 'نوع سوخت',
      required: false,
      options: [
        { value: 'بنزین', label: 'بنزین' },
        { value: 'گاز', label: 'گاز' },
      ],
    });
  });

  it('accepts a numeric legacy option value as text', () => {
    const result = selectDefinition.fromLegacy?.(
      { type: 'select', name: 's', label: 'S', props: { options: [{ label: 'یک', value: 1 }] } },
      'p',
    );
    expect(result !== 'not-mine' && result?.ok && result.field).toMatchObject({
      options: [{ value: '1', label: 'یک' }],
    });
  });

  it('allows a legacy select with no options (an empty list)', () => {
    const result = selectDefinition.fromLegacy?.(
      { type: 'select', name: 's', label: 'S', props: { options: [] } },
      'p',
    );
    expect(result !== 'not-mine' && result?.ok && result.field).toMatchObject({ options: [] });
  });

  it.each([
    ['options missing', { type: 'select', name: 's', label: 'S' }, 'fields[1].props.options'],
    [
      'options not a list',
      { type: 'select', name: 's', label: 'S', props: { options: 'x' } },
      'fields[1].props.options',
    ],
    [
      'an option without a label',
      { type: 'select', name: 's', label: 'S', props: { options: [{ value: 'a' }] } },
      'fields[1].props.options[0]',
    ],
    [
      'an option that is not an object',
      { type: 'select', name: 's', label: 'S', props: { options: ['a'] } },
      'fields[1].props.options[0]',
    ],
  ])('rejects a legacy select with %s', (_name, raw, path) => {
    const result = selectDefinition.fromLegacy?.(raw, 'fields[1]');
    expect(
      result !== 'not-mine' && result?.ok === false && result.issues.map((i) => i.path),
    ).toContain(path);
  });

  it('does not claim other legacy types', () => {
    expect(selectDefinition.fromLegacy?.({ type: 'input', name: 's', label: 'S' }, 'p')).toBe(
      'not-mine',
    );
  });

  it('reads a v2 select', () => {
    const result = selectDefinition.fromV2(
      { kind: 'select', name: 'fuel_type', label: 'نوع سوخت', options, rules: { required: true } },
      'fields[0]',
    );
    expect(result).toEqual({
      ok: true,
      warnings: [],
      field: { kind: 'select', name: 'fuel_type', label: 'نوع سوخت', required: true, options },
    });
  });

  it('rejects a v2 select without options or with a malformed option', () => {
    expect(selectDefinition.fromV2({ kind: 'select', name: 's', label: 'S' }, 'fields[0]').ok).toBe(
      false,
    );
    const bad = selectDefinition.fromV2(
      { kind: 'select', name: 's', label: 'S', options: [{ value: 1, label: 'x' }] },
      'fields[0]',
    );
    expect(bad.ok === false && bad.issues.map((i) => i.path)).toContain(
      'fields[0].options[0].value',
    );
  });
});

// TC-U15
describe('select kind: validation', () => {
  it.each([
    ['required and nothing chosen', field({ required: true }), '', ['required']],
    ['optional and nothing chosen', field(), '', []],
    ['a listed value', field({ required: true }), 'gas', []],
    ['a value that is not listed', field(), 'diesel', ['not_an_option']],
    ['the label instead of the value', field(), 'بنزین', ['not_an_option']],
    ['required with no options at all', field({ required: true, options: [] }), '', ['required']],
  ])('%s', (_name, f, value, codes) => {
    expect(codesFor(selectDefinition.valueSchema(f), value)).toEqual(codes);
  });
});

describe('select kind: value and encoding', () => {
  it('starts with nothing chosen, or at the default value', () => {
    expect(selectDefinition.defaultValue(field())).toBe('');
    expect(selectDefinition.defaultValue(field({ defaultValue: 'gas' }))).toBe('gas');
  });

  it('sends the chosen value (not the label)', () => {
    const body = new FormData();
    selectDefinition.appendTo(field(), 'gas', body);
    expect(body.get('fuel_type')).toBe('gas');
  });
});
