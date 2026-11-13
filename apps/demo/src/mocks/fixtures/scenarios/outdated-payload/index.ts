import { v2CarPayload } from '../../v2-car';

const outdatedPayload: unknown = {
  ...(v2CarPayload as object),
  formId: 'outdated',
  schemaVersion: 3,
};

export { outdatedPayload };
