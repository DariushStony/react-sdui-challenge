import { defineKind } from '../../core/kind';
import { readLegacyBase } from '../../core/legacy';
import type { TextareaField } from '../../core/model';
import { appendString, readStringV2, stringDefault, stringValueSchema } from '../string-field';

// The brief names three input kinds, but its own sample contains a textarea, so it is supported.
export const textareaDefinition = defineKind<TextareaField>({
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
