import { v2CarPayload } from '../../v2-car';
import { v2Fields } from '../v2-fields';
import { rating } from '../rating';

const unknownOptionalPayload: unknown = {
  ...(v2CarPayload as object),
  formId: 'unknown-optional',
  fields: [...v2Fields, rating],
};

export { unknownOptionalPayload };
