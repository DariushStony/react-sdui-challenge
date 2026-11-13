import { useMutation } from '@tanstack/react-query';
import {
  type FormModel,
  type FormValues,
  type KindDefinition,
  buildFormData,
  parseServerErrors,
} from '@dynamic-form/renderer';
import { submitForm } from '../../client/submit-form';
import type { SubmitResult } from '../submit-result';

/** Sends the values as multipart. A 422 whose body cannot be read is treated like a network failure. */
function useSubmitMutation(
  formId: string,
  model: FormModel,
  definitions: readonly KindDefinition[],
) {
  return useMutation<SubmitResult, Error, FormValues>({
    mutationFn: async (values) => {
      const response = await submitForm(formId, buildFormData(model, values, definitions));
      if (response.type === 'success') return { ok: true };
      if (response.type === 'validation') {
        const errors = parseServerErrors(
          response.body,
          model.fields.map((field) => field.name),
        );
        // A 422 that names nothing to fix would leave the person with no feedback at all.
        if (errors !== null && (errors.form.length > 0 || Object.keys(errors.fields).length > 0)) {
          return { ok: false, kind: 'validation', errors };
        }
      }
      return { ok: false, kind: 'network' };
    },
  });
}

export { useSubmitMutation };
