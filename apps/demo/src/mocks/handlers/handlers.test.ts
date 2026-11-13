import { apiUrl } from '../../api/base-url';
import { fetchForm } from '../../api/client/fetch-form';
import { HttpError } from '../../api/client/http-error';
import { submitForm } from '../../api/client/submit-form';
import { normalize } from '@dynamic-form/renderer';
import { resetMockState } from './reset-mock-state';

// The mock is the stand-in for the backend (API contract section 5). These tests pin down the table
// in that section, so every client path stays reachable from the browser and from tests.
// (They run against the shared test server, which already serves these handlers.)

const parsed = async (formId: string) => normalize(await fetchForm(formId), formId);

describe('GET /api/forms/:formId', () => {
  it.each(['car', 'car-v2'])('serves "%s" as a form the normalizer accepts', async (formId) => {
    expect(await parsed(formId)).toMatchObject({ ok: true });
  });

  it('serves the legacy sample as version 1 and the v2 example as version 2', async () => {
    const legacy = await parsed('car');
    const v2 = await parsed('car-v2');
    expect(legacy.ok && legacy.model.schemaVersion).toBe(1);
    expect(v2.ok && v2.model.schemaVersion).toBe(2);
  });

  it('serves an unknown optional kind, which the normalizer skips with a warning', async () => {
    const result = await parsed('unknown-optional');
    expect(result.ok && result.warnings.length).toBeGreaterThan(0);
  });

  it.each([
    ['unknown-required', 'unknown-required-kind'],
    ['outdated', 'outdated'],
    ['broken', 'invalid'],
    ['duplicate-names', 'duplicate-name'],
  ])('serves "%s", which is rejected as %s', async (formId, reason) => {
    expect(await parsed(formId)).toMatchObject({ ok: false, reason });
  });

  it.each(['missing', 'no-such-form'])('answers 404 for "%s"', async (formId) => {
    const error = await fetchForm(formId).catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(HttpError);
    expect(error instanceof HttpError && error.status).toBe(404);
  });

  it('fails the first load of "flaky-load" with 500, then serves the car form', async () => {
    const first = await fetchForm('flaky-load').catch((reason: unknown) => reason);
    expect(first instanceof HttpError && first.status).toBe(500);
    expect(await parsed('flaky-load')).toMatchObject({ ok: true });
  });

  it('starts "flaky-load" over after resetMockState', async () => {
    await fetchForm('flaky-load').catch(() => undefined);
    await fetchForm('flaky-load');
    resetMockState();
    await expect(fetchForm('flaky-load')).rejects.toBeInstanceOf(HttpError);
  });
});

function carBody(overrides: Record<string, string> = {}): FormData {
  const values: Record<string, string> = {
    brand: 'پژو',
    year: '2019',
    fuel_type: 'petrol',
    technical_condition: '',
    ...overrides,
  };
  const body = new FormData();
  for (const [name, value] of Object.entries(values)) body.append(name, value);
  return body;
}

async function validationBody(formId: string, body: FormData) {
  const result = await submitForm(formId, body);
  expect(result.type).toBe('validation');
  return result.type === 'validation' ? (result.body as Record<string, unknown>) : {};
}

describe('POST /api/forms/:formId/submissions', () => {
  it('accepts a valid submission with 201 and lists the files it received', async () => {
    const body = carBody();
    body.append('car_images', new File(['abc'], 'front.png', { type: 'image/png' }));

    const result = await submitForm('car-v2', body);

    expect(result.type).toBe('success');
    expect(result.type === 'success' && result.body).toMatchObject({
      id: expect.any(String),
      files: [{ name: 'front.png', size: 3 }],
    });
  });

  it('reports a missing required field with its code', async () => {
    const body = await validationBody('car-v2', carBody({ brand: '' }));
    expect(body['errors']).toMatchObject({ brand: [{ code: 'required' }] });
  });

  it('applies the rules of the form, with their params', async () => {
    const body = await validationBody('car-v2', carBody({ year: '2999' }));
    expect(body['errors']).toMatchObject({ year: [{ code: 'too_big', params: { max: 2024 } }] });
  });

  it('checks the files against the limits of the field', async () => {
    const body = carBody();
    body.append(
      'car_images',
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' }),
    );
    const errors = (await validationBody('car-v2', body))['errors'];
    expect(errors).toMatchObject({
      car_images: [{ code: 'file_too_large', params: { file: 'big.png' } }],
    });
  });

  it('refuses the brand "bad" with a code the client has no text for, and a Persian fallback message', async () => {
    const body = await validationBody('car-v2', carBody({ brand: 'bad' }));
    expect(body['errors']).toMatchObject({
      brand: [{ code: 'brand_not_allowed', message: expect.stringMatching(/\S/) }],
    });
  });

  it('names a field the form does not have, so the form-level alert is exercised', async () => {
    const body = carBody();
    body.append('surprise', 'x');
    expect((await validationBody('car-v2', body))['errors']).toMatchObject({
      surprise: [{ code: expect.any(String) }],
    });
  });

  it('answers "closed" with a form-level error', async () => {
    expect(await validationBody('closed', carBody())).toMatchObject({
      formErrors: [{ code: 'form_closed' }],
    });
  });

  it('fails the first submit of "flaky-submit" with 500, then accepts', async () => {
    // "flaky-submit" serves the legacy form, whose options are the Persian words themselves.
    const body = () => carBody({ fuel_type: 'بنزین' });
    expect(await submitForm('flaky-submit', body())).toEqual({ type: 'network' });
    expect((await submitForm('flaky-submit', body())).type).toBe('success');
  });

  it.each(['no-such-form', 'outdated'])(
    'answers 404 when "%s" cannot be submitted to',
    async (formId) => {
      const response = await fetch(apiUrl(`/api/forms/${formId}/submissions`), {
        method: 'POST',
        body: carBody(),
      });
      expect(response.status).toBe(404);
    },
  );

  it('treats a form that does not exist, or cannot be shown, as a failure', async () => {
    expect(await submitForm('no-such-form', carBody())).toEqual({ type: 'network' });
    expect(await submitForm('outdated', carBody())).toEqual({ type: 'network' });
  });
});
