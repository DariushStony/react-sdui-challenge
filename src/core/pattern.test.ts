// @vitest-environment node
import { compilePattern } from './pattern';

// A `pattern` rule arrives from the server as a string. It must never be able to throw while the
// form renders (NFR-08), and it behaves like the HTML `pattern` attribute: the whole value must match.
describe('compilePattern', () => {
  it('matches only when the whole value matches', () => {
    const regex = compilePattern('[A-Z]{2}');
    expect(regex?.test('AB')).toBe(true);
    expect(regex?.test('ABC')).toBe(false);
    expect(regex?.test('xAB')).toBe(false);
  });

  it('keeps alternation inside the anchors', () => {
    const regex = compilePattern('cat|dog');
    expect(regex?.test('cat')).toBe(true);
    expect(regex?.test('dog')).toBe(true);
    expect(regex?.test('catdog')).toBe(false);
  });

  it('works with Persian character ranges', () => {
    const regex = compilePattern('[\\u0600-\\u06FF ]+');
    expect(regex?.test('سلام دنیا')).toBe(true);
    expect(regex?.test('hello')).toBe(false);
  });

  it.each(['(', '[a-', '*abc', '(?<n>a)(?<n>b)'])(
    'returns null for the broken pattern %j',
    (pattern) => {
      expect(compilePattern(pattern)).toBeNull();
    },
  );
});
