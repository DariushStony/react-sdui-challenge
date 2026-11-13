import {
  type FormModel,
  type FormValues,
  type KindDefinition,
  type SubmitOutcome,
  buildFormData,
} from '@dynamic-form/renderer';
import { t } from '../../../messages/t';
import type { DryRunResult } from '../../presets/dry-run-result';
import { describeRequest } from '../describe-request';

type DryRunOptions = {
  model: FormModel;
  definitions: readonly KindDefinition[];
  result: DryRunResult;
};

/**
 * The preview's `onSubmit`. It builds the body with the real `buildFormData`, so what is shown is
 * what would be sent, and then answers the way the chosen scenario says. It has no `fetch`.
 */
function createDryRun({
  model,
  definitions,
  result,
}: DryRunOptions): (values: FormValues) => Promise<SubmitOutcome> {
  return async (values) => {
    if (result === 'network') return { ok: false, kind: 'network' };

    if (result === 'validation') {
      const first = model.fields[0]?.name;
      return {
        ok: false,
        kind: 'validation',
        errors: {
          fields: first === undefined ? {} : { [first]: [{ code: 'invalid' }] },
          form: [{ code: 'simulated_error', message: t('dry_run_simulated_error') }],
        },
      };
    }

    const request = describeRequest(model.formId, buildFormData(model, values, definitions));
    return {
      ok: true,
      summary: (
        <>
          <p>{t('dry_run_title')}</p>
          <pre dir="ltr">{request}</pre>
        </>
      ),
    };
  };
}

export { createDryRun };
