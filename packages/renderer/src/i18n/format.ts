// Display-only formatting. Rules and the server work in plain numbers and bytes; these functions are
// used when a number or a size is shown to a person.
import { faCatalog } from './catalog.fa';

const LOCALE = 'fa-IR';

// No thousands separator: a limit such as 1900 reads better as ۱۹۰۰ than as ۱٬۹۰۰.
// Enough digits that a limit reads as it was written; 0.005 must not show as 0.01.
const plain = new Intl.NumberFormat(LOCALE, { useGrouping: false, maximumFractionDigits: 20 });
const oneDecimal = new Intl.NumberFormat(LOCALE, { useGrouping: false, maximumFractionDigits: 1 });

export function formatNumber(value: number): string {
  return plain.format(value);
}

// Binary units, matching how sizes are read from the payload (core/sizes.ts).
// The names come from the catalog like every other piece of text.
const UNITS: readonly (readonly [factor: number, name: string])[] = [
  [1024 ** 3, faCatalog['unit_gigabyte'] ?? 'GB'],
  [1024 ** 2, faCatalog['unit_megabyte'] ?? 'MB'],
  [1024, faCatalog['unit_kilobyte'] ?? 'KB'],
  [1, faCatalog['unit_byte'] ?? 'B'],
];

/** Shows a byte count with the largest unit that keeps the number at 1 or more, such as ۵ مگابایت. */
export function formatBytes(bytes: number): string {
  const [factor, name] =
    UNITS.find(([unitFactor]) => bytes >= unitFactor) ?? UNITS[UNITS.length - 1]!;
  return `${oneDecimal.format(bytes / factor)} ${name}`;
}
