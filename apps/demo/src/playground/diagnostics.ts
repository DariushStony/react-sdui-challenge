import { type Normalizer, type ParseResult } from '@dynamic-form/renderer';

/** What the editor's text amounts to. There is always one of these; reading it never throws. */
export type Analysis =
  | { readonly type: 'empty' }
  | { readonly type: 'invalid-json'; readonly message: string }
  | { readonly type: 'parsed'; readonly result: ParseResult };

const PLAYGROUND_FORM_ID = 'playground';

/**
 * Turns the text in the editor into something the view can show. The only logic here is "is it
 * JSON"; whether it is a usable form is the normalizer's call, exactly as in the real app (FR-37).
 */
export function analyzeInput(text: string, normalize: Normalizer): Analysis {
  if (text.trim() === '') return { type: 'empty' };
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    return {
      type: 'invalid-json',
      message: error instanceof Error ? error.message : String(error),
    };
  }
  return { type: 'parsed', result: normalize(value, PLAYGROUND_FORM_ID) };
}
