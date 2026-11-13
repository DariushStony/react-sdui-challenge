import { type ParseResult } from '@dynamic-form/renderer/core';

/** What the editor's text amounts to. There is always one of these; reading it never throws. */
type Analysis =
  | { readonly type: 'empty' }
  | { readonly type: 'invalid-json'; readonly message: string }
  | { readonly type: 'parsed'; readonly result: ParseResult };

export type { Analysis };
