// @vitest-environment node
import type { FormModel } from '../../../core/model/form-model';
import { modelKey } from '.';

// The form keeps its state while the model it describes stays the same, and starts over when the model
// changes. "The same" means the same content: a host that builds an identical model on every render (the
// obvious way to write it) must not lose what was typed.
const model = (label: string, extra: Partial<FormModel> = {}): FormModel => ({
  formId: 'car',
  schemaVersion: 2,
  fields: [{ kind: 'text', name: 'brand', label, required: false, rules: {} }],
  ...extra,
});

describe('modelKey', () => {
  it('is the same for two models with the same content, built separately', () => {
    expect(modelKey(model('برند'))).toBe(modelKey(model('برند')));
  });

  it('is the same every time it is asked about one model', () => {
    const one = model('برند');
    expect(modelKey(one)).toBe(modelKey(one));
  });

  it.each([
    ['a label', model('مدل')],
    ['a form id', model('برند', { formId: 'other' })],
    ['a schema version', model('برند', { schemaVersion: 1 })],
    ['a field', model('برند', { fields: [] })],
  ])('differs when %s differs', (_name, other) => {
    expect(modelKey(other)).not.toBe(modelKey(model('برند')));
  });
});
