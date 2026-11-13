// @vitest-environment node
import type { FormModel, FormValues } from '../core/model';
import { FIELD_DEFINITIONS, normalize } from '../fields/definitions';
import { buildValuesSchema } from './build-values-schema';
import { codedErrorsOf, createResolver } from './resolver';

// TC-U17. The stock zod resolver for react-hook-form keeps only an issue's type and message, so the
// params (the file name, the size limit) would be lost; this resolver keeps the code and the params
// (ADR-0003).
const result = normalize(
  {
    schemaVersion: 2,
    fields: [
      { kind: 'text', name: 'brand', label: 'برند', rules: { required: true } },
      { kind: 'number', name: 'year', label: 'سال', rules: { min: 1900 } },
      {
        kind: 'file',
        name: 'car_images',
        label: 'تصاویر',
        multiple: true,
        rules: { accept: ['image/*'], maxBytes: 5 },
      },
    ],
  },
  'f',
);
if (!result.ok) throw new Error('the model must parse');
const model: FormModel = result.model;

const resolver = createResolver(buildValuesSchema(model, FIELD_DEFINITIONS));
const options = { fields: {}, shouldUseNativeValidation: false };

const file = (name: string, size: number, type: string) =>
  new File(['x'.repeat(size)], name, { type });

describe('createResolver', () => {
  it('returns the values and no errors when everything is valid', async () => {
    const values: FormValues = {
      brand: 'پژو',
      year: '1950',
      car_images: [file('a.png', 3, 'image/png')],
    };
    expect(await resolver(values, undefined, options)).toEqual({ values, errors: {} });
  });

  it('returns one error entry per failing field, keyed by field name', async () => {
    const outcome = await resolver({ brand: '', year: '1800', car_images: [] }, undefined, options);
    expect(outcome.values).toEqual({});
    expect(Object.keys(outcome.errors).sort()).toEqual(['brand', 'year']);
  });

  it('keeps the code and the params of each error', async () => {
    const outcome = await resolver({ brand: '', year: '1800', car_images: [] }, undefined, options);
    expect(codedErrorsOf(outcome.errors['brand'])).toEqual([{ code: 'required' }]);
    expect(codedErrorsOf(outcome.errors['year'])).toEqual([
      { code: 'too_small', params: { min: 1900 } },
    ]);
  });

  it('exposes the first code as the error type and message, as react-hook-form expects', async () => {
    const outcome = await resolver({ brand: '', year: '1950', car_images: [] }, undefined, options);
    expect(outcome.errors['brand']).toMatchObject({ type: 'required', message: 'required' });
  });

  it('keeps one error per failing file on a file field', async () => {
    const outcome = await resolver(
      {
        brand: 'x',
        year: '1950',
        car_images: [file('a.exe', 1, 'application/x-msdownload'), file('big.png', 6, 'image/png')],
      },
      undefined,
      options,
    );
    expect(codedErrorsOf(outcome.errors['car_images'])).toEqual([
      { code: 'file_type', params: { file: 'a.exe', accept: 'image/*' } },
      { code: 'file_too_large', params: { file: 'big.png', maxBytes: 5 } },
    ]);
  });

  it('reads nothing from an entry that carries no codes', () => {
    expect(codedErrorsOf(undefined)).toEqual([]);
    expect(codedErrorsOf({ type: 'required', message: 'x' })).toEqual([]);
  });
});
