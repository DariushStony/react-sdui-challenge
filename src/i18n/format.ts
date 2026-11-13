// Display-only formatting. Rules and the server work in plain numbers and bytes; these functions are
// used when a number or a size is shown to a person.
const LOCALE = 'fa-IR';

// No thousands separator: a limit such as 1900 reads better as ۱۹۰۰ than as ۱٬۹۰۰.
const plain = new Intl.NumberFormat(LOCALE, { useGrouping: false, maximumFractionDigits: 2 });
const oneDecimal = new Intl.NumberFormat(LOCALE, { useGrouping: false, maximumFractionDigits: 1 });

export function formatNumber(value: number): string {
  return plain.format(value);
}

// Binary units, matching how sizes are read from the payload (core/sizes.ts).
const UNITS: readonly (readonly [factor: number, name: string])[] = [
  [1024 ** 3, 'گیگابایت'],
  [1024 ** 2, 'مگابایت'],
  [1024, 'کیلوبایت'],
  [1, 'بایت'],
];

/** Shows a byte count with the largest unit that keeps the number at 1 or more, such as ۵ مگابایت. */
export function formatBytes(bytes: number): string {
  const [factor, name] = UNITS.find(([unitFactor]) => bytes >= unitFactor) ?? [1, 'بایت'];
  return `${oneDecimal.format(bytes / factor)} ${name}`;
}
