import type { FieldSize } from '../../model/field-size';

const SIZE_TOKENS: readonly FieldSize[] = ['small', 'medium', 'large'];

/** A server size hint is only ever a token name; anything else is dropped (PRD FR-14). */
function sizeToken(value: unknown): FieldSize | undefined {
  return SIZE_TOKENS.find((token) => token === value);
}

export { sizeToken };
