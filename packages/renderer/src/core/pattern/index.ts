// Like the HTML `pattern` attribute, the whole value must match, so the pattern is anchored; and
// like it, the pattern is read in Unicode mode (`v`, then `u`) so a server can write \p{L}. A few
// older patterns are only valid without the flag (an escaped "-" outside a class), hence the last try.
const FLAGS = ['v', 'u', ''] as const;

/**
 * Compiles a server-supplied `pattern` rule. A pattern that does not compile returns null instead of
 * throwing: a broken rule from the server must not be able to break rendering (NFR-08).
 */
function compilePattern(pattern: string): RegExp | null {
  for (const flags of FLAGS) {
    try {
      // The bare pattern must be valid on its own. Wrapped in the anchors, "a)|(b" would compile
      // and quietly stop being anchored.
      new RegExp(pattern, flags);
      return new RegExp(`^(?:${pattern})$`, flags);
    } catch {
      // Try the next, looser mode.
    }
  }
  return null;
}

export { compilePattern };
