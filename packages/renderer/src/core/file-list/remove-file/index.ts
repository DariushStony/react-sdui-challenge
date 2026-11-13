import type { FileIdentity } from '../file-identity';
import { fileKey } from '../file-key';

/** Returns the list without the file that has this key; other files keep their order. */
function removeFile<T extends FileIdentity>(current: readonly T[], key: string): T[] {
  const index = current.findIndex((file) => fileKey(file) === key);
  return current.filter((_, position) => position !== index);
}

export { removeFile };
