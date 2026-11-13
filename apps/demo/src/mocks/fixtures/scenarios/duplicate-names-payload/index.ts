import { v2CarPayload } from '../../v2-car';
import { v2Fields } from '../v2-fields';

const duplicateNamesPayload: unknown = {
  ...(v2CarPayload as object),
  formId: 'duplicate-names',
  fields: [...v2Fields, v2Fields[0]],
};

export { duplicateNamesPayload };
