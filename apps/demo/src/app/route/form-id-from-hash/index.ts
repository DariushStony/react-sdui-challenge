import { DEFAULT_FORM_ID } from '../default-form-id';

/**
 * Which form to show, from the address: `#/forms/<id>`. A hash needs no server support, so the
 * production preview works on any static host. Anything else shows the form from the brief.
 */
function formIdFromHash(hash: string): string {
  const match = /^#\/forms\/([^/]+)\/?$/.exec(hash);
  if (match?.[1] === undefined) return DEFAULT_FORM_ID;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    // A malformed escape such as "%E0%A4%A" is not a form id; show the default, not a crash.
    return DEFAULT_FORM_ID;
  }
}

export { formIdFromHash };
