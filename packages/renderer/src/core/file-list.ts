export type FileIdentity = {
  readonly name: string;
  readonly size: number;
  readonly lastModified: number;
};

// A browser File has no id. Name, size and last-modified time together identify "the same file"
// well enough to stop a double selection; JSON keeps the key unambiguous for odd file names.
export function fileKey(file: FileIdentity): string {
  return JSON.stringify([file.name, file.size, file.lastModified]);
}

/** Appends files that are not already listed (also dropping repeats inside the new selection). */
export function addFiles<T extends FileIdentity>(
  current: readonly T[],
  incoming: readonly T[],
): T[] {
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

/** Returns the list without the file that has this key; other files keep their order. */
export function removeFile<T extends FileIdentity>(current: readonly T[], key: string): T[] {
  const index = current.findIndex((file) => fileKey(file) === key);
  return current.filter((_, position) => position !== index);
}
