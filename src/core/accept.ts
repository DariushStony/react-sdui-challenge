export type FileLike = { readonly name: string; readonly type: string };

/**
 * Whether a file satisfies an `accept` list of MIME types, `type/*` wildcards and `.ext` extensions.
 * The browser's file picker applies the same list only as a hint (a dropped or renamed file can
 * bypass it), so this runs on every selected file. An empty list means no restriction.
 */
export function acceptMatches(file: FileLike, accept: readonly string[]): boolean {
  if (accept.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.some((raw) => {
    const token = raw.trim().toLowerCase();
    if (token.startsWith('.')) return name.endsWith(token);
    // Some systems report no MIME type; then only an extension token can match.
    if (type === '') return false;
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}
