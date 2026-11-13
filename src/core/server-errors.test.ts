// @vitest-environment node
import { parseServerErrors } from './server-errors';

// TC-U19. A 422 body names errors per field; a name the form does not have, and form-level errors,
// are shown together in the form-level alert (PRD FR-33). A body that cannot be read returns null so
// the caller can treat it as a generic failure.
const known = ['brand', 'car_images'];

describe('parseServerErrors', () => {
  it('keeps errors for known fields, with their params and fallback text', () => {
    const result = parseServerErrors(
      {
        errors: {
          brand: [{ code: 'too_long', params: { max: 40 } }],
          car_images: [
            {
              code: 'file_too_large',
              params: { file: 'a.jpg', maxBytes: 5 },
              message: 'حجم زیاد است',
            },
          ],
        },
      },
      known,
    );
    expect(result).toEqual({
      fields: {
        brand: [{ code: 'too_long', params: { max: 40 } }],
        car_images: [
          {
            code: 'file_too_large',
            params: { file: 'a.jpg', maxBytes: 5 },
            message: 'حجم زیاد است',
          },
        ],
      },
      form: [],
    });
  });

  it('moves errors for an unknown field name into the form-level list', () => {
    const result = parseServerErrors(
      { errors: { mystery: [{ code: 'bad' }], brand: [{ code: 'required' }] } },
      known,
    );
    expect(result).toEqual({ fields: { brand: [{ code: 'required' }] }, form: [{ code: 'bad' }] });
  });

  it('reads form-level errors', () => {
    const result = parseServerErrors({ formErrors: [{ code: 'form_closed' }] }, known);
    expect(result).toEqual({ fields: {}, form: [{ code: 'form_closed' }] });
  });

  it('treats an empty object as no errors', () => {
    expect(parseServerErrors({}, known)).toEqual({ fields: {}, form: [] });
  });

  it('ignores a field with an empty list of errors: there is nothing to show for it', () => {
    expect(parseServerErrors({ errors: { brand: [] } }, known)).toEqual({ fields: {}, form: [] });
    expect(
      parseServerErrors({ errors: { brand: [], car_images: [{ code: 'required' }] } }, known)
        ?.fields,
    ).toEqual({ car_images: [{ code: 'required' }] });
  });

  it('keeps several errors for one field in order', () => {
    const result = parseServerErrors({ errors: { brand: [{ code: 'a' }, { code: 'b' }] } }, known);
    expect(result?.fields['brand']?.map((e) => e.code)).toEqual(['a', 'b']);
  });

  it('drops params that are not strings or numbers', () => {
    const result = parseServerErrors(
      { errors: { brand: [{ code: 'x', params: { ok: 1, bad: { n: 1 } } }] } },
      known,
    );
    expect(result?.fields['brand']).toEqual([{ code: 'x', params: { ok: 1 } }]);
  });

  it.each([
    ['null', null],
    ['a string', 'oops'],
    ['a list', []],
    ['errors that is not an object', { errors: [] }],
    ['an error list that is not a list', { errors: { brand: 'x' } }],
    ['an error without a code', { errors: { brand: [{ message: 'x' }] } }],
    ['formErrors that is not a list', { formErrors: {} }],
  ])('returns null for %s', (_name, body) => {
    expect(parseServerErrors(body, known)).toBeNull();
  });
});
