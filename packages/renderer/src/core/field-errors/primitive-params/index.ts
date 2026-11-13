function primitiveParams(
  raw: Record<string, unknown> | undefined,
): Record<string, string | number> | undefined {
  if (raw === undefined) return undefined;
  const entries = Object.entries(raw).filter(
    (entry): entry is [string, string | number] =>
      typeof entry[1] === 'string' || typeof entry[1] === 'number',
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export { primitiveParams };
