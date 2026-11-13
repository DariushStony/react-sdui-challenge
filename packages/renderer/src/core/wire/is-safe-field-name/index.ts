// react-hook-form silently ignores these names, so the input would accept no keystrokes.
const RESERVED_NAMES = new Set(['constructor', 'prototype', '__proto__']);

/**
 * A field name is also a multipart part name and a react-hook-form path. The form reads "." and
 * "[" / "]" as path separators ("a.b" becomes a nested value) and drops quotes from a path, so such
 * a name could never round-trip. Spaces are fine: the form keeps them as part of the key.
 */
function isSafeFieldName(name: string): boolean {
  return name !== '' && !/[.[\]'"]/.test(name) && !RESERVED_NAMES.has(name);
}

export { isSafeFieldName };
