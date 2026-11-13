import type { Normalizer } from '../../../shared/normalizer';
import type { Analysis } from '../analysis';

const PLAYGROUND_FORM_ID = 'playground';

/**
 * Turns the text in the editor into something the view can show. The only logic here is "is it
 * JSON"; whether it is a usable form is the normalizer's call, exactly as in the real app (FR-37).
 */
function analyzeInput(text: string, normalize: Normalizer): Analysis {
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

export { analyzeInput };
