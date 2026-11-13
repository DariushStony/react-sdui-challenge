import type { ParsedNumber } from '../parsed-number';
import { toAsciiDigits } from '../to-ascii-digits';

// U+2212 MINUS SIGN

const NUMBER = /^-?\d+(\.\d+)?$/;

/**
 * Parses what a person typed into a number. The rule is deliberately strict (no exponent, no plus
 * sign, no trailing dot): a form value must mean one thing to the browser and to the server.
 */
function parseNumber(text: string): ParsedNumber {
  const normalized = toAsciiDigits(text).trim();
  if (!NUMBER.test(normalized)) return { ok: false };
  const value = Number(normalized);
  // A very long run of digits overflows to Infinity, which no server rule can reason about.
  return Number.isFinite(value) ? { ok: true, value } : { ok: false };
}

export { parseNumber };
