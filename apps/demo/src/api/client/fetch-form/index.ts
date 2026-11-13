import { apiUrl } from '../../base-url';
import { withTimeout } from '../with-timeout';
import { HttpError } from '../http-error';
import { readJson } from '../read-json';

// A request that never answers must end in an error the person can retry, not in a spinner or a
// busy button for ever. A submit may carry several large files, so it is allowed much longer.
const LOAD_TIMEOUT_MS = 15_000;

/** Fetches a form's raw description. Anything but a 2xx throws; the caller normalizes the body. */
async function fetchForm(
  formId: string,
  signal?: AbortSignal,
  timeoutMs = LOAD_TIMEOUT_MS,
): Promise<unknown> {
  const response = await fetch(apiUrl(`/api/forms/${encodeURIComponent(formId)}`), {
    headers: { Accept: 'application/json' },
    signal: withTimeout(signal, timeoutMs),
  });
  if (!response.ok) throw new HttpError(response.status);
  return readJson(response);
}

export { fetchForm };
