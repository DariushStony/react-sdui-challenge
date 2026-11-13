import { buildFormData } from '../core/form-data';
import type { KindDefinition } from '../core/kind';
import type { FormModel, FormValues } from '../core/model';
import type { SubmitOutcome } from '../engine/outcome';
import { t } from '../i18n/t';
import type { DryRunResult } from './presets';

/** The request the real client would send, as text: same body, nothing sent (ADR-0013). */
export function describeRequest(formId: string, body: FormData): string {
  const parts = [...body.entries()].map(([name, value]) =>
    typeof value === 'string'
      ? `${name}: ${JSON.stringify(value)}`
      : `${name}: ${value.name} (${value.type}, ${value.size} bytes)`,
  );
  return [
    `POST /api/forms/${encodeURIComponent(formId)}/submissions`,
    'Content-Type: multipart/form-data (the browser adds the boundary)',
    '',
    ...parts,
  ].join('\n');
}

type DryRunOptions = {
  model: FormModel;
  definitions: readonly KindDefinition[];
  result: DryRunResult;
};

/**
 * The preview's `onSubmit`. It builds the body with the real `buildFormData`, so what is shown is
 * what would be sent, and then answers the way the chosen scenario says. It has no `fetch`.
 */
export function createDryRun({
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
