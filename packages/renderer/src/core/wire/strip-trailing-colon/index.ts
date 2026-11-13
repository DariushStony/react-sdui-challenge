// Code points, not literals: the ASCII colon and the full-width colon look alike in an editor.
const COLON_CODE_POINTS = new Set([0x003a, 0xff1a]);

/** Drops the label's one trailing colon (legacy labels end with ":"); the design adds its own. */
function stripTrailingColon(label: string): string {
  const trimmed = label.trim();
  const last = Array.from(trimmed).at(-1);
  if (last !== undefined && COLON_CODE_POINTS.has(last.codePointAt(0) ?? -1)) {
    return trimmed.slice(0, -last.length).trim();
  }
  return trimmed;
}

export { stripTrailingColon };
