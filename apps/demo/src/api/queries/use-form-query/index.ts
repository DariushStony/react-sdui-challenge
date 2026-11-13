import { useQuery } from '@tanstack/react-query';
import { type ParseResult } from '@dynamic-form/renderer/core';
import type { Normalizer } from '../../../shared/normalizer';

import { fetchForm } from '../../client/fetch-form';

/**
 * Loads a form and normalizes it inside the query, so what is cached is already a model or a typed
 * rejection and no component ever sees a raw payload. A bad payload is a result, not an error:
 * retrying would only fetch the same bad payload again. Only HTTP and network failures are errors.
 */
function useFormQuery(formId: string, normalize: Normalizer) {
  return useQuery<ParseResult>({
    queryKey: ['form', formId],
    queryFn: async ({ signal }) => normalize(await fetchForm(formId, signal), formId),
    retry: false,
    staleTime: Infinity,
  });
}

export { useFormQuery };
