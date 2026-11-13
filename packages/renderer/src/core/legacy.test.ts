// @vitest-environment node
import { readLegacyBase } from './legacy';

// The legacy field shape: { label, name, type, props, style }. Every kind starts from the same base
// (name, label, required, placeholder, size); the rest of `props` belongs to the kind.
describe('readLegacyBase', () => {
  it('reads the common properties and drops presentation data', () => {
    const result = readLegacyBase(
      {
        type: 'input',
        name: 'brand',
        label: 'برند:',
        props: { placeholder: 'برند را وارد کنید', size: 'large', color: '#000000', type: 'text' },
        style: { margin: '10px 0', padding: '8px' },
      },
      'fields[0]',
    );
    expect(result).toEqual({
      ok: true,
      props: { placeholder: 'برند را وارد کنید', size: 'large', color: '#000000', type: 'text' },
      base: {
        name: 'brand',
        label: 'برند',
        required: false,
        placeholder: 'برند را وارد کنید',
        size: 'large',
      },
    });
  });

  it('works without props', () => {
    const result = readLegacyBase({ type: 'select', name: 'fuel', label: 'سوخت' }, 'fields[0]');
    expect(result).toEqual({
      ok: true,
      props: {},
      base: { name: 'fuel', label: 'سوخت', required: false },
    });
  });

  it('drops a size that is not a token', () => {
    const result = readLegacyBase({ name: 'a', label: 'A', props: { size: 'huge' } }, 'p');
    expect(result.ok && 'size' in result.base).toBe(false);
  });

  it.each([
    ['required on the field', { name: 'a', label: 'A', required: true }, true],
    ['required in props', { name: 'a', label: 'A', props: { required: true } }, true],
    ['required that is not a boolean', { name: 'a', label: 'A', required: 'yes' }, false],
    ['no required at all', { name: 'a', label: 'A' }, false],
  ])('%s', (_name, raw, required) => {
    const result = readLegacyBase(raw, 'p');
    expect(result.ok && result.base.required).toBe(required);
  });

  it.each([
    ['missing name', { label: 'A' }, 'p.name'],
    ['empty name', { name: '', label: 'A' }, 'p.name'],
    ['name that is not a string', { name: 5, label: 'A' }, 'p.name'],
    ['name with a dot', { name: 'a.b', label: 'A' }, 'p.name'],
    ['name with brackets', { name: 'a[0]', label: 'A' }, 'p.name'],
    ['missing label', { name: 'a' }, 'p.label'],
    ['props that is not an object', { name: 'a', label: 'A', props: 'x' }, 'p.props'],
  ])('rejects %s with a path to the problem', (_name, raw, path) => {
    const result = readLegacyBase(raw, 'p');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.map((issue) => issue.path)).toContain(path);
  });
});
