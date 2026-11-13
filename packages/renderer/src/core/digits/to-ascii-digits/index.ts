// Code points are used instead of literal characters because look-alikes (the minus sign U+2212
// and the hyphen-minus) cannot be told apart in an editor.
const PERSIAN_ZERO = 0x06f0;

// U+06F0 EXTENDED ARABIC-INDIC DIGIT ZERO, through U+06F9
const ARABIC_INDIC_ZERO = 0x0660;

// U+0660 ARABIC-INDIC DIGIT ZERO, through U+0669
const ARABIC_DECIMAL_SEPARATOR = 0x066b;

// U+066B ARABIC DECIMAL SEPARATOR
const MINUS_SIGN = 0x2212;

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
function toAsciiDigits(text: string): string {
  return Array.from(text, asciiFor).join('');
}

export { toAsciiDigits };
