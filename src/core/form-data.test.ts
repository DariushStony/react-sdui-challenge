// @vitest-environment node
import { z } from 'zod';
import { buildFormData } from './form-data';
import { defineKind } from './kind';
import type { FieldModel, FormModel, TextField } from './model';

// buildFormData asks each kind to add its own parts, in field order. The real encodings are tested
// with the kinds; this checks the assembly: order, missing values, and that unknown values are safe.
const text = defineKind<TextField>({
  kind: 'text',
  fromV2: () => ({ ok: false, issues: [] }),
  valueSchema: () => z.string(),
  defaultValue: () => 'default',
  appendTo: (field, value, body) =>
    body.append(field.name, `text:${typeof value === 'string' ? value : ''}`),
});

const textField = (name: string): TextField => ({
  kind: 'text',
  name,
  label: name,
  required: false,
  rules: {},
});
const model = (fields: FieldModel[]): FormModel => ({ formId: 'f', schemaVersion: 2, fields });

describe('buildFormData', () => {
  it('adds every field in the order of the form', () => {
    const body = buildFormData(model([textField('b'), textField('a')]), { a: '1', b: '2' }, [text]);
    expect([...body.entries()]).toEqual([
      ['b', 'text:2'],
      ['a', 'text:1'],
    ]);
  });

  it('uses the kind default for a field that has no value yet', () => {
    const body = buildFormData(model([textField('a')]), {}, [text]);
    expect(body.get('a')).toBe('text:default');
  });

  it('ignores values for fields that are not in the form', () => {
    const body = buildFormData(model([textField('a')]), { a: '1', stray: '2' }, [text]);
    expect([...body.keys()]).toEqual(['a']);
  });

  it('refuses a field whose kind has no definition, instead of sending a partial form', () => {
    expect(() => buildFormData(model([textField('a')]), { a: '1' }, [])).toThrow(/text/);
  });
});
