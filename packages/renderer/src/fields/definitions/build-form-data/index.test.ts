import { v2CarPayload } from '../../../test/fixtures/v2-car';
import { normalize } from '../normalize';
import { buildFormData } from '.';

// The request body for a form built from the renderer's own kinds, with no list of kinds to pass in:
// each field adds its own parts in the order of the form (docs/api-contract.md, section 4.1).
describe('buildFormData', () => {
  it('builds the multipart body from a model and its values', () => {
    const result = normalize(v2CarPayload, 'car-v2');
    if (!result.ok) throw new Error('the v2 example must parse');
    const file = (name: string) => new File(['x'], name, { type: 'image/png' });

    const body = buildFormData(result.model, {
      brand: '  پژو ',
      year: '۲۰۱۹',
      fuel_type: 'petrol',
      technical_condition: '',
      car_images: [file('front.png'), file('rear.png')],
    });

    expect([...body.keys()]).toEqual([
      'brand',
      'year',
      'fuel_type',
      'technical_condition',
      'car_images',
      'car_images',
    ]);
    expect(body.get('brand')).toBe('پژو');
    expect(body.get('year')).toBe('2019');
    expect(
      body.getAll('car_images').map((part) => (typeof part === 'string' ? part : part.name)),
    ).toEqual(['front.png', 'rear.png']);
  });
});
