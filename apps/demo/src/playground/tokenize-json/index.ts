import type { JsonToken } from '../json-token';
import type { JsonTokenType } from '../json-token-type';

// One pass, one alternative per kind, in this order. Every character matches one of them, so the
// loop always moves on, and the pieces joined give back the text exactly (the box is where a person
// repairs a typo, so text that is not JSON must survive too).
//   1 space  2 string (an unterminated one ends at the end of its line)  3 number  4 literal
//   5 punctuation  6 anything else, up to the next space or punctuation mark
// A number or a literal must not run into more letters: `truest` is one invalid word, not `true`.
const PIECE =
  /(\s+)|("(?:[^"\\\n]|\\.)*"?)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(?![\w.])|((?:true|false|null))(?!\w)|([{}[\],:])|([^\s{}[\],:"]+)/gy;

const TYPES: readonly JsonTokenType[] = [
  'space',
  'string',
  'number',
  'literal',
  'punctuation',
  'invalid',
];

/**
 * Splits JSON text into coloured pieces. It is a lexer and not a parser, so it never fails: a text
 * with a missing bracket is coloured as far as it goes. A string is a key when a colon follows it.
 */
function tokenizeJson(text: string): JsonToken[] {
  const tokens: { type: JsonTokenType; text: string }[] = [];
  PIECE.lastIndex = 0;
  for (let match = PIECE.exec(text); match !== null; match = PIECE.exec(text)) {
    const group = match.findIndex((part, index) => index > 0 && part !== undefined);
    tokens.push({ type: TYPES[group - 1] ?? 'invalid', text: match[0] });
  }

  tokens.forEach((token, index) => {
    if (token.type !== 'string') return;
    const next = tokens.slice(index + 1).find((candidate) => candidate.type !== 'space');
    if (next?.type === 'punctuation' && next.text === ':') token.type = 'key';
  });
  return tokens;
}

export { tokenizeJson };
