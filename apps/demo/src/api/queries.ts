import { useMutation, useQuery } from '@tanstack/react-query';
import {
  type FormModel,
  type FormValues,
  type KindDefinition,
  type Normalizer,
  type ParseResult,
  type ServerErrors,
  buildFormData,
  parseServerErrors,
} from '@dynamic-form/renderer';
import { fetchForm, submitForm } from './client';

/**
 * Loads a form and normalizes it inside the query, so what is cached is already a model or a typed
 * rejection and no component ever sees a raw payload. A bad payload is a result, not an error:
 * retrying would only fetch the same bad payload again. Only HTTP and network failures are errors.
 */
export function useFormQuery(formId: string, normalize: Normalizer) {
  return useQuery<ParseResult>({
    queryKey: ['form', formId],
    queryFn: async ({ signal }) => normalize(await fetchForm(formId, signal), formId),
    retry: false,
    staleTime: Infinity,
  });
}

/** The same three outcomes the form engine understands (`SubmitOutcome`), minus any UI. */
export type SubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly kind: 'validation'; readonly errors: ServerErrors }
  | { readonly ok: false; readonly kind: 'network' };

/** Sends the values as multipart. A 422 whose body cannot be read is treated like a network failure. */
export function useSubmitMutation(
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
