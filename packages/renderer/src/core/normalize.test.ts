// @vitest-environment node
import { z } from 'zod';
import { defineKind, type KindDefinition } from './kind';
import { createNormalizer } from './normalize';
import type { FieldModel, SelectField, TextField } from './model';
import type { ParseResult } from './issues';

// These tests use tiny stand-in kinds so they prove how the normalizer behaves (dispatch, the
// version gate, the unknown-kind policy), not how any real kind reads its fields. The real kinds are
// covered next to their definitions and in the sample payload test.
const text = defineKind<TextField>({
  kind: 'text',
  fromLegacy: (raw, path) =>
    raw['type'] === 'input'
      ? typeof raw['name'] === 'string'
        ? {
            ok: true,
            field: {
              kind: 'text',
              name: raw['name'],
              label: String(raw['label']),
              required: raw['required'] === true,
              rules: {},
            },
            warnings: [{ path, code: 'note', message: 'legacy text' }],
          }
        : { ok: false, issues: [{ path: `${path}.name`, code: 'invalid_value', message: 'name' }] }
      : 'not-mine',
  fromV2: (raw, path) =>
    typeof raw['name'] === 'string'
      ? {
          ok: true,
          field: {
            kind: 'text',
            name: raw['name'],
            label: String(raw['label']),
            required: false,
            rules: {},
          },
          warnings: [],
        }
      : { ok: false, issues: [{ path: `${path}.name`, code: 'invalid_value', message: 'name' }] },
  valueSchema: () => z.string(),
  defaultValue: () => '',
  appendTo: () => undefined,
});

const select = defineKind<SelectField>({
  kind: 'select',
  fromLegacy: (raw) =>
    raw['type'] === 'select'
      ? {
          ok: true,
          field: {
            kind: 'select',
            name: String(raw['name']),
            label: 'S',
            required: false,
            options: [],
          },
          warnings: [],
        }
      : 'not-mine',
  fromV2: (raw) => ({
    ok: true,
    field: { kind: 'select', name: String(raw['name']), label: 'S', required: false, options: [] },
    warnings: [],
  }),
  valueSchema: () => z.string(),
  defaultValue: () => '',
  appendTo: () => undefined,
});

const normalize = createNormalizer([text, select]);

const fieldsOf = (result: ParseResult): readonly FieldModel[] =>
  result.ok ? result.model.fields : [];
const rejection = (result: ParseResult) => (result.ok ? null : result.reason);

describe('payload envelope', () => {
  it.each([
    ['null', null],
    ['a string', 'text'],
    ['a list', []],
    ['a number', 5],
    ['an object without fields', { title: 'x' }],
    ['fields that is not a list', { fields: {} }],
  ])('rejects %s as invalid', (_name, raw) => {
    const result = normalize(raw, 'car');
    expect(rejection(result)).toBe('invalid');
    expect(!result.ok && result.issues.length).toBeGreaterThan(0);
  });

  it('accepts a form with no fields', () => {
    const result = normalize({ fields: [] }, 'car');
    expect(result.ok && result.model.fields).toEqual([]);
  });

  it('puts the requested form id on the model and keeps a title', () => {
    const result = normalize({ schemaVersion: 2, title: 'ثبت آگهی', fields: [] }, 'car-v2');
    expect(result.ok && result.model).toEqual({
      formId: 'car-v2',
      schemaVersion: 2,
      title: 'ثبت آگهی',
      fields: [],
    });
  });
});

// TC-U08
describe('version gate', () => {
  it.each([
    ['no version means legacy', undefined, 1],
    ['an explicit 1 is legacy too', 1, 1],
    ['2 is the current version', 2, 2],
  ])('%s', (_name, schemaVersion, expected) => {
    const result = normalize(
      { ...(schemaVersion === undefined ? {} : { schemaVersion }), fields: [] },
      'f',
    );
    expect(result.ok && result.model.schemaVersion).toBe(expected);
  });

  it('refuses a newer major version with its own reason', () => {
    const result = normalize({ schemaVersion: 3, fields: [] }, 'f');
    expect(rejection(result)).toBe('outdated');
    expect(!result.ok && result.issues[0]?.path).toBe('schemaVersion');
  });

  it.each([
    ['a fraction', 1.5],
    ['a string', '2'],
    ['zero', 0],
    ['a negative number', -1],
    ['null', null],
  ])('refuses %s as invalid', (_name, schemaVersion) => {
    expect(rejection(normalize({ schemaVersion, fields: [] }, 'f'))).toBe('invalid');
  });
});

describe('legacy payloads (no version)', () => {
  it('lets the kind that claims a field read it, keeping order and warnings', () => {
    const result = normalize(
      {
        fields: [
          { type: 'input', name: 'a', label: 'A' },
          { type: 'select', name: 'b' },
          { type: 'input', name: 'c', label: 'C' },
        ],
      },
      'f',
    );
    expect(fieldsOf(result).map((f) => [f.kind, f.name])).toEqual([
      ['text', 'a'],
      ['select', 'b'],
      ['text', 'c'],
    ]);
    expect(result.ok && result.warnings.map((w) => w.path)).toEqual(['fields[0]', 'fields[2]']);
  });

  it('skips a field of an unknown type with a warning', () => {
    const result = normalize(
      {
        fields: [
          { type: 'banana', name: 'x' },
          { type: 'input', name: 'a', label: 'A' },
        ],
      },
      'f',
    );
    expect(fieldsOf(result).map((f) => f.name)).toEqual(['a']);
    expect(result.ok && result.warnings.map((w) => [w.path, w.code])).toContainEqual([
      'fields[0]',
      'unknown_kind',
    ]);
  });

  it('refuses the form when an unknown field says it is required, naming the field', () => {
    const result = normalize({ fields: [{ type: 'banana', name: 'ripe', required: true }] }, 'f');
    expect(rejection(result)).toBe('unknown-required-kind');
    expect(!result.ok && result.issues[0]?.message).toContain('ripe');
    expect(!result.ok && result.issues[0]?.field).toBe('ripe');
  });

  it('also honours `required` inside props for an unknown field', () => {
    const result = normalize(
      { fields: [{ type: 'banana', name: 'ripe', props: { required: true } }] },
      'f',
    );
    expect(rejection(result)).toBe('unknown-required-kind');
  });

  it('reports a field that is not an object', () => {
    const result = normalize({ fields: [5] }, 'f');
    expect(rejection(result)).toBe('invalid');
    expect(!result.ok && result.issues[0]?.path).toBe('fields[0]');
  });

  it('collects the problems of every bad field instead of stopping at the first', () => {
    const result = normalize({ fields: [{ type: 'input' }, { type: 'input' }] }, 'f');
    expect(rejection(result)).toBe('invalid');
    expect(!result.ok && result.issues.map((i) => i.path)).toEqual([
      'fields[0].name',
      'fields[1].name',
    ]);
  });
});

describe('v2 payloads', () => {
  it('dispatches on `kind`', () => {
    const result = normalize(
      {
        schemaVersion: 2,
        fields: [
          { kind: 'text', name: 'a', label: 'A' },
          { kind: 'select', name: 'b', label: 'B' },
        ],
      },
      'f',
    );
    expect(fieldsOf(result).map((f) => f.kind)).toEqual(['text', 'select']);
  });

  it('skips an unknown optional kind with a warning', () => {
    const result = normalize(
      {
        schemaVersion: 2,
        fields: [
          { kind: 'rating', name: 'stars', label: 'S' },
          { kind: 'text', name: 'a', label: 'A' },
        ],
      },
      'f',
    );
    expect(fieldsOf(result).map((f) => f.name)).toEqual(['a']);
    expect(result.ok && result.warnings.map((w) => w.code)).toEqual(['unknown_kind']);
  });

  it('refuses the form when an unknown kind is required', () => {
    const result = normalize(
      {
        schemaVersion: 2,
        fields: [{ kind: 'rating', name: 'stars', label: 'S', rules: { required: true } }],
      },
      'f',
    );
    expect(rejection(result)).toBe('unknown-required-kind');
    expect(!result.ok && result.issues[0]?.message).toContain('stars');
    expect(!result.ok && result.issues[0]?.field).toBe('stars');
  });

  it.each([
    ['no kind', { name: 'a', label: 'A' }],
    ['a kind that is not text', { kind: 5, name: 'a', label: 'A' }],
  ])('rejects a field with %s', (_name, field) => {
    const result = normalize({ schemaVersion: 2, fields: [field] }, 'f');
    expect(rejection(result)).toBe('invalid');
    expect(!result.ok && result.issues[0]?.path).toBe('fields[0].kind');
  });

  it('keeps the problems a kind reports, with its paths', () => {
    const result = normalize({ schemaVersion: 2, fields: [{ kind: 'text', label: 'A' }] }, 'f');
    expect(!result.ok && result.issues.map((i) => i.path)).toEqual(['fields[0].name']);
  });
});

describe('duplicate names', () => {
  it('refuses two fields with the same name, naming it', () => {
    const result = normalize(
      {
        schemaVersion: 2,
        fields: [
          { kind: 'text', name: 'a', label: 'A' },
          { kind: 'select', name: 'a', label: 'B' },
        ],
      },
      'f',
    );
    expect(rejection(result)).toBe('duplicate-name');
    expect(!result.ok && result.issues[0]).toMatchObject({
      path: 'fields[1]',
      code: 'duplicate_name',
    });
    expect(!result.ok && result.issues[0]?.message).toContain('a');
    expect(!result.ok && result.issues[0]?.field).toBe('a');
  });

  it('does not count a skipped unknown field as a duplicate', () => {
    const result = normalize(
      {
        schemaVersion: 2,
        fields: [
          { kind: 'rating', name: 'a', label: 'S' },
          { kind: 'text', name: 'a', label: 'A' },
        ],
      },
      'f',
    );
    expect(result.ok).toBe(true);
  });
});

describe('which problem wins', () => {
  it('reports invalid fields before an unknown required kind, and that before duplicates', () => {
    const invalid = normalize(
      {
        schemaVersion: 2,
        fields: [
          { kind: 'text', label: 'A' },
          { kind: 'rating', name: 'r', label: 'R', rules: { required: true } },
        ],
      },
      'f',
    );
    expect(rejection(invalid)).toBe('invalid');

    const unknownRequired = normalize(
      {
        schemaVersion: 2,
        fields: [
          { kind: 'text', name: 'a', label: 'A' },
          { kind: 'text', name: 'a', label: 'A' },
          { kind: 'rating', name: 'r', label: 'R', rules: { required: true } },
        ],
      },
      'f',
    );
    expect(rejection(unknownRequired)).toBe('unknown-required-kind');
  });
});

// TC-U21 (the part that belongs to core): the normalizer knows no kind by name; it only uses the
// definitions it is given. The component side of adding a kind is covered in the field tests.
describe('the list of kinds is injected', () => {
  it('treats a kind that is not in the list as unknown', () => {
    const onlyText = createNormalizer([text]);
    const result = onlyText(
      {
        schemaVersion: 2,
        fields: [
          { kind: 'select', name: 'b', label: 'B' },
          { kind: 'text', name: 'a', label: 'A' },
        ],
      },
      'f',
    );
    expect(fieldsOf(result).map((f) => f.name)).toEqual(['a']);
    expect(result.ok && result.warnings.map((w) => w.code)).toEqual(['unknown_kind']);
  });

  it('uses whatever definition it is given for a kind', () => {
    const replaced: KindDefinition = defineKind<SelectField>({
      kind: 'select',
      fromV2: () => ({
        ok: true,
        field: { kind: 'select', name: 'custom', label: 'custom', required: false, options: [] },
        warnings: [],
      }),
      valueSchema: () => z.string(),
      defaultValue: () => '',
      appendTo: () => undefined,
    });
    const result = createNormalizer([replaced])(
      { schemaVersion: 2, fields: [{ kind: 'select', name: 'ignored', label: 'x' }] },
      'f',
    );
    expect(fieldsOf(result).map((f) => f.name)).toEqual(['custom']);
  });
});
