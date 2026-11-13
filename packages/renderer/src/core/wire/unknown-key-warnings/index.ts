import type { Issue } from '../../issues/issue';
import type { Raw } from '../raw';

/** One warning per key the client does not know; the key is ignored, the form still renders. */
function unknownKeyWarnings(raw: Raw, known: readonly string[], path: string): Issue[] {
  return Object.keys(raw)
    .filter((key) => !known.includes(key))
    .map((key) => ({
      path: `${path}.${key}`,
      code: 'unknown_key',
      message: `Ignored unknown key "${key}"`,
    }));
}

export { unknownKeyWarnings };
