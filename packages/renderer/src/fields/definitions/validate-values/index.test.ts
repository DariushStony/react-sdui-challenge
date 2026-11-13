import { v2CarPayload } from '../../../test/fixtures/v2-car';
import { normalize } from '../normalize';
import { validateValues } from '.';

// What the form checks in the browser, a server can check again from the same rules: the values go in,
// message codes per field come out.
function carModel() {
  const result = normalize(v2CarPayload, 'car-v2');
  if (!result.ok) throw new Error('the v2 example must parse');
  return result.model;
}

const valid = {
  brand: 'پژو',
  year: '2019',
  fuel_type: 'petrol',
  technical_condition: '',
  car_images: [],
};

describe('validateValues', () => {
  it('finds nothing wrong with valid values', () => {
    expect(validateValues(carModel(), valid)).toEqual({});
  });

  it('reports a missing required field by its code', () => {
    expect(validateValues(carModel(), { ...valid, brand: '' })).toEqual({
      brand: [{ code: 'required' }],
    });
  });

  it('reports a broken rule with the values the text needs', () => {
    expect(validateValues(carModel(), { ...valid, year: '2999' })).toEqual({
      year: [{ code: 'too_big', params: { max: 2024 } }],
    });
  });

  it('reports every field that is wrong, and only those', () => {
    const errors = validateValues(carModel(), { ...valid, brand: '', fuel_type: 'steam' });
    expect(Object.keys(errors).toSorted()).toEqual(['brand', 'fuel_type']);
  });

  it('checks the files against the limits of their field', () => {
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    expect(validateValues(carModel(), { ...valid, car_images: [big] })).toEqual({
      car_images: [
        { code: 'file_too_large', params: { file: 'big.png', maxBytes: 5 * 1024 * 1024 } },
      ],
    });
  });

  it('accepts Persian digits, the way the form does', () => {
    expect(validateValues(carModel(), { ...valid, year: '۲۰۱۹' })).toEqual({});
  });
});
