// @vitest-environment node
import { z } from 'zod';
import { defineKind } from './kind';
import type { NumberField, TextField } from './model';

// A kind definition is written against its own field type; the registry stores them all as one
// type. defineKind does that widening once, and refuses a field of the wrong kind at run time
// instead of silently validating it with the wrong rules.
const textField: TextField = {
  kind: 'text',
  name: 'brand',
  label: 'Brand',
  required: false,
  rules: {},
};
const numberField: NumberField = {
  kind: 'number',
  name: 'year',
  label: 'Year',
  required: false,
  rules: {},
};

const text = defineKind<TextField>({
  kind: 'text',
  fromV2: (_raw, _path) => ({ ok: true, field: textField, warnings: [] }),
  valueSchema: () => z.string(),
  defaultValue: (field) => field.defaultValue ?? 'fallback',
  appendTo: (field, value, body) => body.append(field.name, typeof value === 'string' ? value : ''),
});

describe('defineKind', () => {
  it('keeps the kind and passes a matching field through', () => {
    expect(text.kind).toBe('text');
    expect(text.defaultValue(textField)).toBe('fallback');

    const body = new FormData();
    text.appendTo(textField, 'پژو', body);
    expect(body.get('brand')).toBe('پژو');
  });

  it('refuses a field of another kind, naming both kinds', () => {
    expect(() => text.defaultValue(numberField)).toThrow(/year.*number.*text/);
    expect(() => text.valueSchema(numberField)).toThrow();
    expect(() => text.appendTo(numberField, '1', new FormData())).toThrow();
  });

  it('only has fromLegacy when the definition has one', () => {
    expect('fromLegacy' in text).toBe(false);

    const withLegacy = defineKind<TextField>({
      kind: 'text',
      fromLegacy: () => 'not-mine',
      fromV2: () => ({ ok: false, issues: [] }),
      valueSchema: () => z.string(),
      defaultValue: () => '',
      appendTo: () => undefined,
    });
    expect(withLegacy.fromLegacy?.({}, 'p')).toBe('not-mine');
  });
});
