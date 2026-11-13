// @vitest-environment node
import { parseNumber, toAsciiDigits } from './digits';

// TC-U02. Persian users type Persian or Arabic-Indic digits; they are normalized before validation
// and submission (FR-15).
// U+2212 MINUS SIGN looks like a hyphen, so the test builds it from its code point.
const MINUS = String.fromCodePoint(0x2212);

describe('toAsciiDigits', () => {
  it.each([
    ['۱۳۹۸', '1398'],
    ['٢٠٢٤', '2024'],
    ['۱۲٫۵', '12.5'],
    [`${MINUS}۵`, '-5'],
    ['12abc۳', '12abc3'],
    ['', ''],
  ])('turns %j into %j', (input, expected) => {
    expect(toAsciiDigits(input)).toBe(expected);
  });
});

describe('parseNumber', () => {
  it.each([
    ['1398', 1398],
    ['۱۳۹۸', 1398],
    ['٣٫٥', 3.5],
    ['-12', -12],
    [`${MINUS}۵`, -5],
    ['0', 0],
    ['12.50', 12.5],
    ['  7  ', 7],
  ])('reads %j as %d', (input, value) => {
    expect(parseNumber(input)).toEqual({ ok: true, value });
  });

  it.each(['', '   ', 'abc', '1.2.3', '--5', '12.', '.5', '1e3', '+5', '1 2', '12abc'])(
    'rejects %j',
    (input) => {
      expect(parseNumber(input)).toEqual({ ok: false });
    },
  );
});
