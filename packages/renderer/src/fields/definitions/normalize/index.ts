import { createNormalizer } from '../../../core/normalize/create-normalizer';
import { FIELD_DEFINITIONS } from '../field-definitions';

const normalize = createNormalizer(FIELD_DEFINITIONS);

export { normalize };
