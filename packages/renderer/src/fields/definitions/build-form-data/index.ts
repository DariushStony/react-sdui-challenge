import { buildFormData as buildWith } from '../../../core/form-data';
import type { FormModel } from '../../../core/model/form-model';
import type { FormValues } from '../../../core/model/form-values';
import { FIELD_DEFINITIONS } from '../field-definitions';

/**
 * The multipart body for a submission: each field, in the order of the form, adds its own parts
 * (ADR-0006). Send it with `fetch` and no `Content-Type` header, so the browser adds the boundary.
 */
function buildFormData(model: FormModel, values: FormValues): FormData {
  return buildWith(model, values, FIELD_DEFINITIONS);
}

export { buildFormData };
