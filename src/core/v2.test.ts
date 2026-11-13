// @vitest-environment node
import { z } from 'zod';
import { readV2 } from './v2';

// The v2 field shape: { kind, name, label, ..., rules }. A kind supplies a schema for its own rules;
// the common properties and `required` are read here once.
const rules = z.object({ maxLength: z.number().int().min(0).optional() });

describe('readV2', () => {
  it('reads every common property and the kind rules', () => {
    const result = readV2(
      {
        kind: 'text',
        name: 'brand',
        label: 'برند',
        description: 'نام سازنده',
        placeholder: 'برند',
        defaultValue: 'پژو',
        disabled: true,
        readOnly: false,
        size: 'small',
        rules: { required: true, maxLength: 40 },
      },
      'fields[0]',
      rules,
    );
    expect(result).toEqual({
      ok: true,
      warnings: [],
      rules: { maxLength: 40 },
      base: {
        name: 'brand',
        label: 'برند',
        required: true,
        description: 'نام سازنده',
        placeholder: 'برند',
        defaultValue: 'پژو',
        disabled: true,
        readOnly: false,
        size: 'small',
      },
    });
  });

  it('defaults to not required and empty rules when there are none', () => {
    const result = readV2({ kind: 'text', name: 'a', label: 'A' }, 'p', rules);
    expect(result).toEqual({
      ok: true,
      warnings: [],
      rules: {},
      base: { name: 'a', label: 'A', required: false },
    });
  });

  it('warns about unknown keys and unknown rules, and ignores them', () => {
    const result = readV2(
      {
        kind: 'text',
        name: 'a',
        label: 'A',
        colour: 'red',
        rules: { maxLength: 5, strange: true },
      },
      'fields[3]',
      rules,
    );
    expect(result.ok && result.warnings.map((w) => w.path)).toEqual([
      'fields[3].colour',
      'fields[3].rules.strange',
    ]);
    expect(result.ok && result.rules).toEqual({ maxLength: 5 });
  });

  it('does not warn about keys the kind reads itself', () => {
    const result = readV2(
      { kind: 'select', name: 'a', label: 'A', options: [], multiple: true },
      'p',
      rules,
      ['options', 'multiple'],
    );
    expect(result.ok && result.warnings).toEqual([]);
  });

  it('warns about a size that is not a token and drops it', () => {
    const result = readV2({ kind: 'text', name: 'a', label: 'A', size: 'huge' }, 'p', rules);
    expect(result.ok && 'size' in result.base).toBe(false);
    expect(result.ok && result.warnings.map((w) => w.code)).toEqual(['unknown_size']);
  });

  it.each([
    ['an empty name', { kind: 'text', name: '', label: 'A' }, 'p.name'],
    ['a name with a dot', { kind: 'text', name: 'a.b', label: 'A' }, 'p.name'],
    ['a name with brackets', { kind: 'text', name: 'a[0]', label: 'A' }, 'p.name'],
    ['a missing label', { kind: 'text', name: 'a' }, 'p.label'],
    [
      'a description that is not text',
      { kind: 'text', name: 'a', label: 'A', description: 3 },
      'p.description',
    ],
    ['rules that are not an object', { kind: 'text', name: 'a', label: 'A', rules: [] }, 'p.rules'],
    [
      'a required that is not a boolean',
      { kind: 'text', name: 'a', label: 'A', rules: { required: 'yes' } },
      'p.rules.required',
    ],
    [
      'a rule with the wrong type',
      { kind: 'text', name: 'a', label: 'A', rules: { maxLength: 'x' } },
      'p.rules.maxLength',
    ],
    [
      'a negative length rule',
      { kind: 'text', name: 'a', label: 'A', rules: { maxLength: -1 } },
      'p.rules.maxLength',
    ],
  ])('rejects %s with a path to the problem', (_name, raw, path) => {
    const result = readV2(raw, 'p', rules);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.map((issue) => issue.path)).toContain(path);
  });
});
