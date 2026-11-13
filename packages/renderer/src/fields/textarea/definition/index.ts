import { defineKind } from '../../../core/kind/define-kind';
import { readLegacyBase } from '../../../core/legacy/read-legacy-base';
import type { TextareaField } from '../../../core/model/textarea-field';
import { appendString } from '../../string-field/append-string';
import { readStringV2 } from '../../string-field/read-string-v2';
import { stringDefault } from '../../string-field/string-default';
import { stringValueSchema } from '../../string-field/string-value-schema';

// The brief names three input kinds, but its own sample contains a textarea, so it is supported.
const textareaDefinition = defineKind<TextareaField>({
  kind: 'textarea',

  fromLegacy(raw, path) {
    if (raw['type'] !== 'textarea') return 'not-mine';
    const read = readLegacyBase(raw, path);
    if (!read.ok) return read;
    // `rows` and `cols` are presentation; the design system decides the size.
    return { ok: true, field: { kind: 'textarea', ...read.base, rules: {} }, warnings: [] };
  },

  fromV2(raw, path) {
    const read = readStringV2(raw, path);
    if (!read.ok) return read;
    return {
      ok: true,
      field: { kind: 'textarea', ...read.base, rules: read.rules },
      warnings: read.warnings,
    };
  },

  valueSchema: stringValueSchema,
  defaultValue: stringDefault,
  appendTo: appendString,
});

export { textareaDefinition };
