import { defaultUiKit, type SubmitOutcome } from '@dynamic-form/renderer';
import { buildFormData, type FormModel, type FormValues } from '@dynamic-form/renderer/core';
import { t } from '../../../messages/t';
import type { DryRunResult } from '../../presets/dry-run-result';
import { describeRequest } from '../describe-request';

const { TextArea } = defaultUiKit;

type DryRunOptions = {
  model: FormModel;
  result: DryRunResult;
};

/**
 * The preview's `onSubmit`. It builds the body with the real `buildFormData`, so what is shown is
 * what would be sent, and then answers the way the chosen scenario says. It has no `fetch`.
 */
function createDryRun({
  model,
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

    const request = describeRequest(model.formId, buildFormData(model, values));
    return {
      ok: true,
      summary: (
        <>
          <p>{t('dry_run_title')}</p>
          <TextArea
            readOnly
            dir="ltr"
            rows={request.split('\n').length}
            value={request}
            aria-label={t('dry_run_title')}
          />
        </>
      ),
    };
  };
}

export { createDryRun };
