import { render, screen } from '@testing-library/react';
import {
  FIELD_DEFINITIONS,
  type FormModel,
  type FormValues,
  normalize,
} from '@dynamic-form/renderer';
import { t } from '../../test/t';
import { createDryRun } from './create-dry-run';
import { describeRequest } from './describe-request';

// ADR-0013: submitting in the Playground sends nothing. It shows the request that would be sent and
// can pretend the server answered with an error.
const model: FormModel = (() => {
  const result = normalize(
    {
      schemaVersion: 2,
      fields: [
        { kind: 'text', name: 'brand', label: 'برند' },
        { kind: 'number', name: 'year', label: 'سال' },
        { kind: 'file', name: 'photos', label: 'عکس', multiple: true },
      ],
    },
    'demo',
  );
  if (!result.ok) throw new Error('fixture model must parse');
  return result.model;
})();

const values: FormValues = {
  brand: ' پژو ',
  year: '۲۰۱۹',
  photos: [new File(['abc'], 'front.png', { type: 'image/png' })],
};

describe('describeRequest', () => {
  it('names the request, says the browser adds the boundary, and lists every part', () => {
    const body = new FormData();
    body.append('brand', 'پژو');
    body.append('empty', '');
    body.append('photos', new File(['abc'], 'front.png', { type: 'image/png' }));

    expect(describeRequest('demo', body)).toBe(
      [
        'POST /api/forms/demo/submissions',
        'Content-Type: multipart/form-data (the browser adds the boundary)',
        '',
        'brand: "پژو"',
        'empty: ""',
        'photos: front.png (image/png, 3 bytes)',
      ].join('\n'),
    );
  });

  it('encodes the form id the way the real client does', () => {
    expect(describeRequest('a b', new FormData())).toContain('POST /api/forms/a%20b/submissions');
  });
});

describe('createDryRun', () => {
  const dryRun = (result: 'success' | 'validation' | 'network') =>
    createDryRun({ model, definitions: FIELD_DEFINITIONS, result });

  it('succeeds with a summary of the request built from the values, and sends nothing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const outcome = await dryRun('success')(values);

    expect(outcome.ok).toBe(true);
    render(<>{outcome.ok ? outcome.summary : null}</>);
    expect(screen.getByText(t('dry_run_title'))).toBeVisible();
    // The request is built by the same code as the real one: numbers are normalized, text trimmed.
    expect(screen.getByText(/year: "2019"/)).toBeVisible();
    expect(screen.getByText(/brand: "پژو"/)).toBeVisible();
    expect(screen.getByText(/photos: front.png \(image\/png, 3 bytes\)/)).toBeVisible();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('can answer with server errors: one on the first field and one for the whole form', async () => {
    const outcome = await dryRun('validation')(values);
    expect(outcome).toMatchObject({
      ok: false,
      kind: 'validation',
      errors: {
        fields: { brand: [{ code: 'invalid' }] },
        form: [{ code: 'simulated_error', message: t('dry_run_simulated_error') }],
      },
    });
  });

  it('can answer with a network failure', async () => {
    expect(await dryRun('network')(values)).toEqual({ ok: false, kind: 'network' });
  });

  it('still reports the form-level error when the form has no fields', async () => {
    const empty: FormModel = { ...model, fields: [] };
    const outcome = await createDryRun({
      model: empty,
      definitions: FIELD_DEFINITIONS,
      result: 'validation',
    })({});
    expect(outcome).toMatchObject({ ok: false, kind: 'validation', errors: { fields: {} } });
  });
});
