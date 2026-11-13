import { errorsByField } from '../../../core/field-errors/errors-by-field';
import type { FieldError } from '../../../core/issues/field-error';
import type { FormModel } from '../../../core/model/form-model';
import type { FormValues } from '../../../core/model/form-values';
import { buildValuesSchema } from '../../../engine/build-values-schema';
import { FIELD_DEFINITIONS } from '../field-definitions';

/**
 * Checks values against the rules of a form's fields and returns the message codes per field (an
 * empty object when all is well). It is the same check the form runs in the browser, so a server can
 * apply the same rules again to what it receives (client checks are advisory).
 */
function validateValues(model: FormModel, values: FormValues): Record<string, FieldError[]> {
  const result = buildValuesSchema(model, FIELD_DEFINITIONS).safeParse(values);
  return result.success ? {} : errorsByField(result.error.issues);
}

export { validateValues };
