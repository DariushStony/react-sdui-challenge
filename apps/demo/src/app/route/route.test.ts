import { DEFAULT_FORM_ID } from './default-form-id';
import { formIdFromHash } from './form-id-from-hash';
import { routeFromHash } from './route-from-hash';

// Which form to show comes from the address: `#/forms/<id>`. A hash needs no server support, so the
// production preview works on any static host.
describe('formIdFromHash', () => {
  it.each([
    ['#/forms/car-v2', 'car-v2'],
    ['#/forms/a%20b', 'a b'],
    ['#/forms/outdated/', 'outdated'],
  ])('reads the form id from %s', (hash, id) => {
    expect(formIdFromHash(hash)).toBe(id);
  });

  it.each(['', '#', '#/', '#/forms', '#/forms/', '#/other/car-v2', '#/forms/%E0%A4%A'])(
    'falls back to the default form for "%s"',
    (hash) => {
      expect(formIdFromHash(hash)).toBe(DEFAULT_FORM_ID);
    },
  );

  it('defaults to the form from the brief', () => {
    expect(DEFAULT_FORM_ID).toBe('car');
  });
});

describe('routeFromHash', () => {
  it.each(['#/playground', '#/playground/'])('opens the Playground for "%s"', (hash) => {
    expect(routeFromHash(hash)).toEqual({ view: 'playground' });
  });

  it('opens a form for a form address, and the default form for anything else', () => {
    expect(routeFromHash('#/forms/car-v2')).toEqual({ view: 'form', formId: 'car-v2' });
    expect(routeFromHash('')).toEqual({ view: 'form', formId: DEFAULT_FORM_ID });
    expect(routeFromHash('#/playgroundx')).toEqual({ view: 'form', formId: DEFAULT_FORM_ID });
  });
});
