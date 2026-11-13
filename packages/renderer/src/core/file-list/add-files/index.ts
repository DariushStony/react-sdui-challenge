import type { FileIdentity } from '../file-identity';
import { fileKey } from '../file-key';

/** Appends files that are not already listed (also dropping repeats inside the new selection). */
function addFiles<T extends FileIdentity>(current: readonly T[], incoming: readonly T[]): T[] {
  const seen = new Set(current.map(fileKey));
  const added: T[] = [];
  for (const file of incoming) {
    const key = fileKey(file);
    if (seen.has(key)) continue;
    seen.add(key);
    added.push(file);
  }
  return [...current, ...added];
}

export { addFiles };
