import { defineKind } from '../../core/kind';
import type { TextField } from '../../core/model';
import { readLegacyBase } from '../../core/legacy';
import { isRecord } from '../../core/wire';
import { appendString, readStringV2, stringDefault, stringValueSchema } from '../string-field';

export const textDefinition = defineKind<TextField>({
  kind: 'text',

  // The legacy shape has one `input` type for both text and number; `props.type` tells them apart.
  fromLegacy(raw, path) {
    if (raw['type'] !== 'input') return 'not-mine';
    const props = raw['props'];
    const inputType = isRecord(props) ? props['type'] : undefined;
    if (inputType === 'number') return 'not-mine';

    const read = readLegacyBase(raw, path);
    if (!read.ok) return read;

    const unsupported = inputType !== undefined && inputType !== 'text';
    return {
      ok: true,
      field: { kind: 'text', ...read.base, rules: {} },
      warnings: unsupported
        ? [
            {
              path: `${path}.props.type`,
              code: 'unsupported_input_type',
              message: `Input type ${JSON.stringify(inputType)} is not supported; rendered as text`,
            },
          ]
        : [],
    };
  },

  fromV2(raw, path) {
    const read = readStringV2(raw, path);
    if (!read.ok) return read;
    return {
      ok: true,
      field: { kind: 'text', ...read.base, rules: read.rules },
      warnings: read.warnings,
    };
  },

  valueSchema: stringValueSchema,
  defaultValue: stringDefault,
  appendTo: appendString,
});
