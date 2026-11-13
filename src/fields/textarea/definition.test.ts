// @vitest-environment node
import type { TextareaField } from '../../core/model';
import { codesFor } from '../../test/rules';
import { textareaDefinition } from './definition';

const field = (overrides: Partial<TextareaField> = {}): TextareaField => ({
  kind: 'textarea',
  name: 'technical_condition',
  label: 'توضیحات وضعیت فنی',
  required: false,
  rules: {},
  ...overrides,
});

// The legacy sample has this type although the brief names only three kinds (PRD FR-09).
describe('textarea kind', () => {
  it('claims a legacy textarea and drops rows, cols and styling', () => {
    const result = textareaDefinition.fromLegacy?.(
      {
        type: 'textarea',
        name: 'technical_condition',
        label: 'توضیحات وضعیت فنی:',
        props: { cols: 50, rows: 4, placeholder: 'توضیحات' },
        style: { padding: '10px' },
      },
      'fields[6]',
    );
    expect(result !== 'not-mine' && result?.ok && result.field).toEqual({
      kind: 'textarea',
      name: 'technical_condition',
      label: 'توضیحات وضعیت فنی',
      required: false,
      placeholder: 'توضیحات',
      rules: {},
    });
  });

  it('does not claim other legacy types', () => {
    expect(textareaDefinition.fromLegacy?.({ type: 'input', name: 'a', label: 'A' }, 'p')).toBe(
      'not-mine',
    );
  });

  it('reads a v2 textarea with length rules and warns about a broken pattern', () => {
    const result = textareaDefinition.fromV2(
      {
        kind: 'textarea',
        name: 'notes',
        label: 'یادداشت',
        rules: { maxLength: 500, pattern: '(' },
      },
      'fields[2]',
    );
    expect(result.ok && result.field).toEqual({
      kind: 'textarea',
      name: 'notes',
      label: 'یادداشت',
      required: false,
      rules: { maxLength: 500 },
    });
    expect(result.ok && result.warnings.map((w) => w.code)).toEqual(['invalid_pattern']);
  });

  it.each([
    ['required and empty', field({ required: true }), '', ['required']],
    ['over the maximum', field({ rules: { maxLength: 5 } }), 'abcdef', ['too_long']],
    [
      'multiple lines count as characters',
      field({ rules: { maxLength: 7 } }),
      'ab\ncd\nef',
      ['too_long'],
    ],
    ['within the limits', field({ rules: { minLength: 1, maxLength: 5 } }), 'abc', []],
  ])('validates: %s', (_name, f, value, codes) => {
    expect(codesFor(textareaDefinition.valueSchema(f), value)).toEqual(codes);
  });

  it('starts empty and sends trimmed text under the field name', () => {
    expect(textareaDefinition.defaultValue(field())).toBe('');
    const body = new FormData();
    textareaDefinition.appendTo(field(), '  خوب است\n', body);
    expect(body.get('technical_condition')).toBe('خوب است');
  });
});
