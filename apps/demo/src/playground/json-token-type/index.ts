/** What a stretch of JSON text is, for colouring. `invalid` is text that is not JSON at all. */
type JsonTokenType = 'key' | 'string' | 'number' | 'literal' | 'punctuation' | 'space' | 'invalid';

export type { JsonTokenType };
