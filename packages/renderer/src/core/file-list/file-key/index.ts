import type { FileIdentity } from '../file-identity';

// A browser File has no id. Name, size and last-modified time together identify "the same file"
// well enough to stop a double selection; JSON keeps the key unambiguous for odd file names.
function fileKey(file: FileIdentity): string {
  return JSON.stringify([file.name, file.size, file.lastModified]);
}

export { fileKey };
