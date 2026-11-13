import { apiUrl } from '../../base-url';
import type { SubmitResponse } from '../submit-response';
import { withTimeout } from '../with-timeout';
import { readJson } from '../read-json';

const SUBMIT_TIMEOUT_MS = 120_000;

/**
 * Sends the multipart body. No Content-Type is set on purpose: the browser adds it with the
 * boundary, and setting it by hand would break the upload (ADR-0006). Only 422 is a validation
 * outcome; every other failure, including a thrown network error, is "try again".
 */
async function submitForm(
  formId: string,
  body: FormData,
  signal?: AbortSignal,
  timeoutMs = SUBMIT_TIMEOUT_MS,
): Promise<SubmitResponse> {
  try {
    const response = await fetch(apiUrl(`/api/forms/${encodeURIComponent(formId)}/submissions`), {
      method: 'POST',
      body,
      signal: withTimeout(signal, timeoutMs),
    });
    if (response.status === 422) return { type: 'validation', body: await readJson(response) };
    if (!response.ok) return { type: 'network' };
    return { type: 'success', body: await readJson(response) };
  } catch {
    return { type: 'network' };
  }
}

export { submitForm };
