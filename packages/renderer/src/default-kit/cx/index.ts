/** Joins class names, skipping the ones that are missing or false. */
function cx(...parts: readonly (string | false | undefined)[]): string {
  return parts.filter((part): part is string => typeof part === 'string' && part !== '').join(' ');
}

export { cx };
