import type { JsonTokenType } from '../json-token-type';

/** A piece of the text and what it is. All the pieces of a text, joined, give the text back. */
type JsonToken = {
  readonly type: JsonTokenType;
  readonly text: string;
};

export type { JsonToken };
