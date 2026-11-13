/**
 * Compiles a server-supplied `pattern` rule. Like the HTML `pattern` attribute, the whole value must
 * match, so the pattern is anchored. A pattern that does not compile returns null instead of
 * throwing: a broken rule from the server must not be able to break rendering (NFR-08).
 */
export function compilePattern(pattern: string): RegExp | null {
  try {
    return new RegExp(`^(?:${pattern})$`);
  } catch {
    return null;
  }
}
