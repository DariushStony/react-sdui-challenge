import { v2CarPayload } from '../../v2-car';
import { v2Fields } from '../v2-fields';
import { rating } from '../rating';

const unknownRequiredPayload: unknown = {
  ...(v2CarPayload as object),
  formId: 'unknown-required',
  fields: [...v2Fields, { ...rating, rules: { required: true } }],
};

export { unknownRequiredPayload };
