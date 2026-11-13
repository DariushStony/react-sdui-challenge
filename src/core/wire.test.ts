// @vitest-environment node
import { z } from 'zod';
import {
  isRecord,
  omitUndefined,
  sizeToken,
  stripTrailingColon,
  unknownKeyWarnings,
  zodIssues,
} from './wire';

// Small helpers every kind uses while turning raw payload objects into the canonical model.
describe('isRecord', () => {
  it.each([
    [{}, true],
    [{ a: 1 }, true],
    [[], false],
    [null, false],
    ['text', false],
    [3, false],
    [undefined, false],
  ])('%j -> %s', (value, expected) => {
    expect(isRecord(value)).toBe(expected);
  });
});

describe('stripTrailingColon', () => {
  const fullWidthColon = String.fromCodePoint(0xff1a);

  it.each([
    ['برند:', 'برند'],
    ['برند: ', 'برند'],
    ['  برند :', 'برند'],
    [`برند${fullWidthColon}`, 'برند'],
    ['a::', 'a:'],
    ['a: b', 'a: b'],
    ['برند', 'برند'],
    [':', ''],
  ])('%j -> %j', (label, expected) => {
    expect(stripTrailingColon(label)).toBe(expected);
  });
});

describe('sizeToken', () => {
  it.each([
    ['small', 'small'],
    ['medium', 'medium'],
    ['large', 'large'],
    ['huge', undefined],
    ['LARGE', undefined],
    [5, undefined],
    [undefined, undefined],
  ])('%j -> %j', (value, expected) => {
    expect(sizeToken(value)).toBe(expected);
  });
});

describe('unknownKeyWarnings', () => {
  it('reports each key that is not known, with its path', () => {
    const warnings = unknownKeyWarnings({ a: 1, b: 2, c: 3 }, ['a'], 'fields[1]');
    expect(warnings.map((w) => [w.path, w.code])).toEqual([
      ['fields[1].b', 'unknown_key'],
      ['fields[1].c', 'unknown_key'],
    ]);
  });

  it('reports nothing when every key is known', () => {
    expect(unknownKeyWarnings({ a: 1 }, ['a', 'b'], 'p')).toEqual([]);
  });
});

describe('omitUndefined', () => {
  it('drops undefined values and keeps every other falsy value', () => {
    const result = omitUndefined({ a: undefined, b: 0, c: '', d: false, e: null, f: 'x' });
    expect(result).toEqual({ b: 0, c: '', d: false, e: null, f: 'x' });
    expect('a' in result).toBe(false);
  });
});

describe('zodIssues', () => {
  it('turns zod failures into developer-facing issues with full paths', () => {
    const result = z
      .object({ rules: z.object({ min: z.number() }) })
      .safeParse({ rules: { min: 'x' } });
    expect(result.success).toBe(false);
    if (result.success) return;
    const issues = zodIssues(result.error, 'fields[2]');
    expect(issues).toHaveLength(1);
    expect(issues[0]?.path).toBe('fields[2].rules.min');
    expect(issues[0]?.code).toBe('invalid_value');
    expect(issues[0]?.message.length).toBeGreaterThan(0);
  });

  it('uses the base path when zod reports the value itself', () => {
    const result = z.string().safeParse(5);
    if (result.success) throw new Error('expected a failure');
    expect(zodIssues(result.error, 'fields[0]')[0]?.path).toBe('fields[0]');
  });
});
