import { legacyCarPayload } from './legacy-car';
import { v2CarPayload } from './v2-car';

// Each payload below exists to reach one client path (docs/api-contract.md, section 5). They are
// built from the v2 car form so a difference between two scenarios is only the thing under test.
const v2Fields = (v2CarPayload as { fields: readonly unknown[] }).fields;

const rating = { kind: 'rating', name: 'score', label: 'امتیاز', max: 5 };

export const unknownOptionalPayload: unknown = {
  ...(v2CarPayload as object),
  formId: 'unknown-optional',
  fields: [...v2Fields, rating],
};

export const unknownRequiredPayload: unknown = {
  ...(v2CarPayload as object),
  formId: 'unknown-required',
  fields: [...v2Fields, { ...rating, rules: { required: true } }],
};

export const outdatedPayload: unknown = {
  ...(v2CarPayload as object),
  formId: 'outdated',
  schemaVersion: 3,
};

// Valid JSON that is not a form: `fields` is not a list.
export const brokenPayload: unknown = { title: 'فرم خراب', fields: 'not a list' };

export const duplicateNamesPayload: unknown = {
  ...(v2CarPayload as object),
  formId: 'duplicate-names',
  fields: [...v2Fields, v2Fields[0]],
};

// The Playground's "server error" preset: a normal form whose dry-run submit answers with errors.
export const serverErrorPayload: unknown = {
  ...(v2CarPayload as object),
  formId: 'server-error',
  title: 'سناریوی خطای سرور',
};

/** The payload each form id serves. Ids that need other behavior are handled in `handlers.ts`. */
export const FORM_PAYLOADS: Readonly<Record<string, unknown>> = {
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
