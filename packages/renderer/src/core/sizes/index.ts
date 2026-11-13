const SIZE = /^\s*(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?\s*$/i;

// Why 1024: the legacy payload writes "5MB" with no definition, and 1 MB = 1024 x 1024 bytes is the
// convention browsers and operating systems show for file sizes (PRD FR-28, A-2). If the backend
// disagrees, this table is the one place to change.
const UNIT_BYTES = new Map([
  ['B', 1],
  ['KB', 1024],
  ['MB', 1024 ** 2],
  ['GB', 1024 ** 3],
]);

/** Reads sizes such as "5MB" or "500 kb" into bytes; no unit means bytes. Returns null if malformed. */
function parseSize(input: string): number | null {
  const match = SIZE.exec(input);
  const amount = match?.[1];
  const factor = UNIT_BYTES.get((match?.[2] ?? 'B').toUpperCase());
  if (amount === undefined || factor === undefined) return null;
  // A fractional byte cannot exist, and rounding down never admits a file that is over the limit.
  return Math.floor(Number(amount) * factor);
}

export { parseSize };
