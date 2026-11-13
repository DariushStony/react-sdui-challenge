import { apiUrl } from './base-url';

/** A response that was received but was not a success. */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** How a submit went, in the three ways the UI cares about (API contract 5.2). */
export type SubmitResponse =
  | { readonly type: 'success'; readonly body: unknown }
  | { readonly type: 'validation'; readonly body: unknown }
  | { readonly type: 'network' };

// A body that is not JSON is "no body", not an error: the caller decides if it needed one.
async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

/** Fetches a form's raw description. Anything but a 2xx throws; the caller normalizes the body. */
export async function fetchForm(formId: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(apiUrl(`/api/forms/${encodeURIComponent(formId)}`), {
    headers: { Accept: 'application/json' },
    ...(signal === undefined ? {} : { signal }),
  });
  if (!response.ok) throw new HttpError(response.status);
  return readJson(response);
}

/**
 * Sends the multipart body. No Content-Type is set on purpose: the browser adds it with the
 * boundary, and setting it by hand would break the upload (ADR-0006). Only 422 is a validation
 * outcome; every other failure, including a thrown network error, is "try again".
 */
export async function submitForm(
  formId: string,
  body: FormData,
  signal?: AbortSignal,
): Promise<SubmitResponse> {
  try {
    const response = await fetch(apiUrl(`/api/forms/${encodeURIComponent(formId)}/submissions`), {
      method: 'POST',
      body,
      ...(signal === undefined ? {} : { signal }),
    });
    if (response.status === 422) return { type: 'validation', body: await readJson(response) };
    if (!response.ok) return { type: 'network' };
    return { type: 'success', body: await readJson(response) };
  } catch {
    return { type: 'network' };
  }
}
