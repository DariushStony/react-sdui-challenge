// @vitest-environment node
import { buildFormData } from '../core/form-data';
import type { FormModel } from '../core/model';
import { v2CarPayload } from '../mocks/fixtures/v2-car';
import { FIELD_DEFINITIONS, normalize } from './definitions';

// TC-U18: one submission built from the real kinds. Each kind has its own encoding test; this proves
// they assemble into the multipart body described in docs/api-contract.md, section 4.1.
function carModel(): FormModel {
  const result = normalize(v2CarPayload, 'car-v2');
  if (!result.ok) throw new Error('the v2 example must parse');
  return result.model;
}

const png = (name: string, content: string) => new File([content], name, { type: 'image/png' });

const entries = (body: FormData) =>
  [...body.entries()].map(([key, value]) => [key, value instanceof File ? value.name : value]);

describe('buildFormData with the real kinds', () => {
  it('sends text trimmed, numbers as ASCII, the select value, and each file under one key', () => {
    const body = buildFormData(
      carModel(),
      {
        brand: '  پژو ',
        year: '۱۳۹۸',
        fuel_type: 'petrol',
        technical_condition: '',
        car_images: [png('front.png', 'aaa'), png('rear.png', 'bbbbb')],
      },
      FIELD_DEFINITIONS,
    );
    expect(entries(body)).toEqual([
      ['brand', 'پژو'],
      ['year', '1398'],
      ['fuel_type', 'petrol'],
      ['technical_condition', ''],
      ['car_images', 'front.png'],
      ['car_images', 'rear.png'],
    ]);
  });

  it('sends one file part for one file and none for no files', () => {
    const one = buildFormData(carModel(), { car_images: [png('a.png', 'x')] }, FIELD_DEFINITIONS);
    expect(one.getAll('car_images')).toHaveLength(1);

    const none = buildFormData(carModel(), { car_images: [] }, FIELD_DEFINITIONS);
    expect(none.has('car_images')).toBe(false);
  });

  it('sends an empty string for text fields that were never filled in', () => {
    const body = buildFormData(carModel(), {}, FIELD_DEFINITIONS);
    expect(entries(body)).toEqual([
      ['brand', ''],
      ['year', ''],
      ['fuel_type', ''],
      ['technical_condition', ''],
    ]);
  });
});
