// @vitest-environment node
import type { FileField } from '../../core/model';
import { codesFor, errorsFor } from '../../test/rules';
import { fileDefinition } from './definition';

const file = (name: string, size = 1, type = 'image/png') =>
  new File(['x'.repeat(size)], name, { type });

const field = (overrides: Partial<FileField> = {}): FileField => ({
  kind: 'file',
  name: 'car_images',
  label: 'تصاویر ماشین',
  required: false,
  multiple: true,
  rules: {},
  ...overrides,
});

describe('file kind: reading', () => {
  it('claims the legacy sample field: accept string, "5MB", multiple', () => {
    const result = fileDefinition.fromLegacy?.(
      {
        type: 'file',
        name: 'car_images',
        label: 'تصاویر ماشین:',
        props: { accept: 'image/*', maxSize: '5MB', multiple: true },
        style: { margin: '10px 0' },
      },
      'fields[7]',
    );
    expect(result).toEqual({
      ok: true,
      warnings: [],
      field: {
        kind: 'file',
        name: 'car_images',
        label: 'تصاویر ماشین',
        required: false,
        multiple: true,
        rules: { accept: ['image/*'], maxBytes: 5 * 1024 * 1024 },
      },
    });
  });

  it('splits a comma separated accept string and accepts a list too', () => {
    const base = { type: 'file', name: 'f', label: 'F' };
    const fromString = fileDefinition.fromLegacy?.(
      { ...base, props: { accept: 'image/*, .pdf ,' } },
      'p',
    );
    expect(fromString !== 'not-mine' && fromString?.ok && fromString.field).toMatchObject({
      rules: { accept: ['image/*', '.pdf'] },
    });
    const fromList = fileDefinition.fromLegacy?.(
      { ...base, props: { accept: ['image/*', '.pdf'] } },
      'p',
    );
    expect(fromList !== 'not-mine' && fromList?.ok && fromList.field).toMatchObject({
      rules: { accept: ['image/*', '.pdf'] },
    });
  });

  it('is a single-file field when `multiple` is absent', () => {
    const result = fileDefinition.fromLegacy?.(
      { type: 'file', name: 'f', label: 'F', props: {} },
      'p',
    );
    expect(result !== 'not-mine' && result?.ok && result.field).toMatchObject({
      multiple: false,
      rules: {},
    });
  });

  it('reads a numeric maxSize as bytes', () => {
    const result = fileDefinition.fromLegacy?.(
      { type: 'file', name: 'f', label: 'F', props: { maxSize: 2048 } },
      'p',
    );
    expect(result !== 'not-mine' && result?.ok && result.field).toMatchObject({
      rules: { maxBytes: 2048 },
    });
  });

  it('drops a malformed maxSize and says so (EC-04)', () => {
    const result = fileDefinition.fromLegacy?.(
      { type: 'file', name: 'f', label: 'F', props: { maxSize: 'big' } },
      'fields[7]',
    );
    expect(result !== 'not-mine' && result?.ok && result.field).toMatchObject({ rules: {} });
    expect(
      result !== 'not-mine' && result?.ok && result.warnings.map((w) => [w.path, w.code]),
    ).toEqual([['fields[7].props.maxSize', 'invalid_max_size']]);
  });

  it('does not claim other legacy types', () => {
    expect(fileDefinition.fromLegacy?.({ type: 'input', name: 'f', label: 'F' }, 'p')).toBe(
      'not-mine',
    );
  });

  it('reads a v2 file field with its rules', () => {
    const result = fileDefinition.fromV2(
      {
        kind: 'file',
        name: 'car_images',
        label: 'تصاویر',
        multiple: true,
        rules: { required: true, accept: ['image/*'], maxBytes: 5242880, maxFiles: 5 },
      },
      'fields[4]',
    );
    expect(result).toEqual({
      ok: true,
      warnings: [],
      field: {
        kind: 'file',
        name: 'car_images',
        label: 'تصاویر',
        required: true,
        multiple: true,
        rules: { accept: ['image/*'], maxBytes: 5242880, maxFiles: 5 },
      },
    });
  });

  it('defaults a v2 file field to a single file', () => {
    const result = fileDefinition.fromV2({ kind: 'file', name: 'f', label: 'F' }, 'p');
    expect(result.ok && result.field).toMatchObject({ multiple: false });
  });

  it.each([
    [
      'multiple that is not a boolean',
      { kind: 'file', name: 'f', label: 'F', multiple: 'yes' },
      'fields[0].multiple',
    ],
    [
      'maxFiles of zero',
      { kind: 'file', name: 'f', label: 'F', rules: { maxFiles: 0 } },
      'fields[0].rules.maxFiles',
    ],
    [
      'accept that is not a list',
      { kind: 'file', name: 'f', label: 'F', rules: { accept: 'image/*' } },
      'fields[0].rules.accept',
    ],
    [
      'a fractional maxBytes',
      { kind: 'file', name: 'f', label: 'F', rules: { maxBytes: 1.5 } },
      'fields[0].rules.maxBytes',
    ],
  ])('rejects a v2 file field with %s', (_name, raw, path) => {
    const result = fileDefinition.fromV2(raw, 'fields[0]');
    expect(result.ok === false && result.issues.map((i) => i.path)).toContain(path);
  });
});

// TC-U16
describe('file kind: validation', () => {
  const accepting = (accept: string[], extra: Partial<FileField['rules']> = {}) =>
    field({ rules: { accept, ...extra } });

  it.each([
    ['nothing chosen and required', field({ required: true }), [], ['required']],
    ['nothing chosen and optional', field(), [], []],
    ['a file of an allowed type', accepting(['image/*']), [file('a.png')], []],
    [
      'a file of another type',
      accepting(['image/*']),
      [file('a.pdf', 1, 'application/pdf')],
      ['file_type'],
    ],
    ['a size exactly at the limit', field({ rules: { maxBytes: 10 } }), [file('a.png', 10)], []],
    [
      'a size one byte over the limit',
      field({ rules: { maxBytes: 10 } }),
      [file('a.png', 11)],
      ['file_too_large'],
    ],
    [
      'a count exactly at the limit',
      field({ rules: { maxFiles: 2 } }),
      [file('a.png'), file('b.png')],
      [],
    ],
    [
      'a count one over the limit',
      field({ rules: { maxFiles: 2 } }),
      [file('a.png'), file('b.png'), file('c.png')],
      ['too_many_files'],
    ],
    [
      'two files in a single-file field',
      field({ multiple: false }),
      [file('a.png'), file('b.png')],
      ['too_many_files'],
    ],
    ['one file in a single-file field', field({ multiple: false }), [file('a.png')], []],
    [
      'type and size both wrong on one file',
      accepting(['image/*'], { maxBytes: 5 }),
      [file('a.pdf', 9, 'application/pdf')],
      ['file_type', 'file_too_large'],
    ],
    [
      'problems in two different files, in file order',
      accepting(['image/*'], { maxBytes: 5 }),
      [file('a.png', 9), file('b.pdf', 1, 'application/pdf')],
      ['file_too_large', 'file_type'],
    ],
    ['something that is not a file', field(), ['not a file'], ['invalid']],
  ])('%s', (_name, f, value, codes) => {
    expect(codesFor(fileDefinition.valueSchema(f), value)).toEqual(codes);
  });

  it('names the file and the limit in the params', () => {
    const f = accepting(['image/*', '.pdf'], { maxBytes: 5, maxFiles: 1 });
    expect(errorsFor(fileDefinition.valueSchema(f), [file('big.png', 9)])).toEqual([
      { code: 'file_too_large', params: { file: 'big.png', maxBytes: 5 } },
    ]);
    expect(errorsFor(fileDefinition.valueSchema(f), [file('a.zip', 1, 'application/zip')])).toEqual(
      [{ code: 'file_type', params: { file: 'a.zip', accept: 'image/*, .pdf' } }],
    );
    expect(errorsFor(fileDefinition.valueSchema(f), [file('a.png'), file('b.png')])).toEqual([
      { code: 'too_many_files', params: { max: 1 } },
    ]);
  });
});

describe('file kind: value and encoding', () => {
  it('starts with a new empty list every time', () => {
    const first = fileDefinition.defaultValue(field());
    const second = fileDefinition.defaultValue(field());
    expect(first).toEqual([]);
    expect(first).not.toBe(second);
  });

  it('sends each file under the field name, in order', () => {
    const body = new FormData();
    const a = file('a.png', 3);
    const b = file('b.png', 5);
    fileDefinition.appendTo(field(), [a, b], body);
    expect(
      body.getAll('car_images').map((value) => (value instanceof File ? value.name : value)),
    ).toEqual(['a.png', 'b.png']);
  });

  it('sends no part at all when no file was chosen', () => {
    const body = new FormData();
    fileDefinition.appendTo(field(), [], body);
    expect([...body.keys()]).toEqual([]);
  });

  it('ignores a value that is not a list of files', () => {
    const body = new FormData();
    fileDefinition.appendTo(field(), 'text', body);
    expect([...body.keys()]).toEqual([]);
  });
});
