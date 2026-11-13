import { legacyCarPayload } from '../../legacy-car';
import { v2CarPayload } from '../../v2-car';
import { unknownOptionalPayload } from '../unknown-optional-payload';
import { unknownRequiredPayload } from '../unknown-required-payload';
import { outdatedPayload } from '../outdated-payload';
import { brokenPayload } from '../broken-payload';
import { duplicateNamesPayload } from '../duplicate-names-payload';

/** The payload each form id serves. Ids that need other behavior are handled in `handlers.ts`. */
const FORM_PAYLOADS: Readonly<Record<string, unknown>> = {
  car: legacyCarPayload,
  'car-v2': v2CarPayload,
  'unknown-optional': unknownOptionalPayload,
  'unknown-required': unknownRequiredPayload,
  outdated: outdatedPayload,
  broken: brokenPayload,
  'duplicate-names': duplicateNamesPayload,
  'flaky-load': legacyCarPayload,
  'flaky-submit': legacyCarPayload,
  closed: legacyCarPayload,
};

export { FORM_PAYLOADS };
