// @vitest-environment node
import { z } from 'zod';
import { defineKind } from '../../core/kind/define-kind';
import type { FieldModel } from '../../core/model/field-model';
import type { TextField } from '../../core/model/text-field';
import { FIELD_DEFINITIONS } from '../definitions/field-definitions';
import { defineFieldKind } from '../define-field-kind/define-field-kind';
import { FIELD_KINDS } from '.';

// The registry exists twice on purpose: a pure list for parsing, validating and encoding (no React),
// and the same list with components for rendering. This guards the two against drifting apart.
describe('FIELD_KINDS', () => {
  it('has the same kinds, in the same order, as the pure definitions', () => {
    expect(FIELD_KINDS.map((kind) => kind.definition.kind)).toEqual(
      FIELD_DEFINITIONS.map((definition) => definition.kind),
    );
  });

  it('uses the very same definition objects', () => {
    FIELD_KINDS.forEach((kind, index) => {
      expect(kind.definition).toBe(FIELD_DEFINITIONS[index]);
    });
  });

  it('has one component for every kind', () => {
    for (const kind of FIELD_KINDS) expect(typeof kind.Component).toBe('function');
  });
});

describe('defineFieldKind', () => {
  const definition = defineKind<TextField>({
    kind: 'text',
    fromV2: () => ({ ok: false, issues: [] }),
    valueSchema: () => z.string(),
    defaultValue: () => '',
    appendTo: () => undefined,
  });
  const text = defineFieldKind('text', definition, () => null);

  it('keeps the definition it was given', () => {
    expect(text.definition).toBe(definition);
  });

  it('refuses to render a field of another kind', () => {
    const other: FieldModel = { kind: 'number', name: 'n', label: 'N', required: false, rules: {} };
    expect(() =>
      text.Component({
        field: other,
        id: 'n',
        value: '',
        errors: [],
        onChange: () => undefined,
        onBlur: () => undefined,
        inputRef: () => undefined,
      }),
    ).toThrow(/number.*text/);
  });
});
