// Code points are used instead of literal characters because look-alikes (the minus sign U+2212
// and the hyphen-minus) cannot be told apart in an editor.
const PERSIAN_ZERO = 0x06f0; // U+06F0 EXTENDED ARABIC-INDIC DIGIT ZERO, through U+06F9
const ARABIC_INDIC_ZERO = 0x0660; // U+0660 ARABIC-INDIC DIGIT ZERO, through U+0669
const ARABIC_DECIMAL_SEPARATOR = 0x066b; // U+066B ARABIC DECIMAL SEPARATOR
const MINUS_SIGN = 0x2212; // U+2212 MINUS SIGN

const NUMBER = /^-?\d+(\.\d+)?$/;

function asciiFor(char: string): string {
  const code = char.codePointAt(0) ?? 0;
  if (code >= PERSIAN_ZERO && code <= PERSIAN_ZERO + 9) return String(code - PERSIAN_ZERO);
  if (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_ZERO + 9) {
    return String(code - ARABIC_INDIC_ZERO);
  }
  if (code === ARABIC_DECIMAL_SEPARATOR) return '.';
  if (code === MINUS_SIGN) return '-';
  return char;
}

/** Maps Persian and Arabic-Indic digits, the Arabic decimal separator and the minus sign to ASCII. */
export function toAsciiDigits(text: string): string {
  return Array.from(text, asciiFor).join('');
}

export type ParsedNumber = { ok: true; value: number } | { ok: false };

/**
 * Parses what a person typed into a number. The rule is deliberately strict (no exponent, no plus
 * sign, no trailing dot): a form value must mean one thing to the browser and to the server.
 */
export function parseNumber(text: string): ParsedNumber {
  const normalized = toAsciiDigits(text).trim();
  if (!NUMBER.test(normalized)) return { ok: false };
  const value = Number(normalized);
  // A very long run of digits overflows to Infinity, which no server rule can reason about.
  return Number.isFinite(value) ? { ok: true, value } : { ok: false };
}
