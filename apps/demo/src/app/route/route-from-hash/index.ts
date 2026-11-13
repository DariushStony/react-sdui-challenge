import type { Route } from '../route';
import { formIdFromHash } from '../form-id-from-hash';

/** The view for an address: the Playground at `#/playground`, otherwise a form. */
function routeFromHash(hash: string): Route {
  if (/^#\/playground\/?$/.test(hash)) return { view: 'playground' };
  return { view: 'form', formId: formIdFromHash(hash) };
}

export { routeFromHash };
