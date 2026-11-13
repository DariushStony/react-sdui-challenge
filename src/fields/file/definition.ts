import { z } from 'zod';
import { acceptMatches } from '../../core/accept';
import type { Issue } from '../../core/issues';
import { defineKind } from '../../core/kind';
import { readLegacyBase } from '../../core/legacy';
import type { FieldValue, FileField } from '../../core/model';
import { parseSize } from '../../core/sizes';
import { readV2 } from '../../core/v2';
import { omitUndefined } from '../../core/wire';

const fileRules = z.object({
  accept: z.array(z.string()).optional(),
  maxBytes: z.number().int().min(0).optional(),
  maxFiles: z.number().int().min(1).optional(),
});

// A browser File and a test File come from different classes, so check the shape instead of the
// constructor. The message is a code so toFieldErrors never shows an English zod message.
const fileLike = z.custom<File>(
  (value) =>
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'size' in value &&
    'type' in value,
  { message: 'invalid' },
);

function legacyAccept(value: unknown): string[] | undefined {
  const tokens = typeof value === 'string' ? value.split(',') : Array.isArray(value) ? value : [];
  const cleaned = tokens
    .filter((token): token is string => typeof token === 'string')
    .map((token) => token.trim())
    .filter((token) => token !== '');
  return cleaned.length > 0 ? cleaned : undefined;
}

type LegacyMaxBytes = { value: number | undefined; warning?: Issue };

// "5MB" is the legacy spelling; a plain number is read as bytes. A value that cannot be read must
// not silently become "no limit" without a trace, so it is reported (PRD EC-04).
function legacyMaxBytes(value: unknown, path: string): LegacyMaxBytes {
  if (value === undefined) return { value: undefined };
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return { value: Math.floor(value) };
  }
  const bytes = typeof value === 'string' ? parseSize(value) : null;
  if (bytes !== null) return { value: bytes };
  return {
    value: undefined,
    warning: {
      path,
      code: 'invalid_max_size',
      message: `Ignored a maxSize that could not be read: ${JSON.stringify(value)}`,
    },
  };
}

export const fileDefinition = defineKind<FileField>({
  kind: 'file',

  fromLegacy(raw, path) {
    if (raw['type'] !== 'file') return 'not-mine';
    const read = readLegacyBase(raw, path);
    if (!read.ok) return read;

    const maxBytes = legacyMaxBytes(read.props['maxSize'], `${path}.props.maxSize`);
    return {
      ok: true,
      field: {
        kind: 'file',
        ...read.base,
        multiple: read.props['multiple'] === true,
        rules: omitUndefined({
          accept: legacyAccept(read.props['accept']),
          maxBytes: maxBytes.value,
        }),
      },
      warnings: maxBytes.warning ? [maxBytes.warning] : [],
    };
  },

  fromV2(raw, path) {
    const read = readV2(raw, path, fileRules, ['multiple']);
    const multiple = raw['multiple'];
    if (!read.ok || (multiple !== undefined && typeof multiple !== 'boolean')) {
      const issues: Issue[] = read.ok ? [] : [...read.issues];
      if (multiple !== undefined && typeof multiple !== 'boolean') {
        issues.push({
          path: `${path}.multiple`,
          code: 'invalid_value',
          message: 'multiple must be a boolean',
        });
      }
      return { ok: false, issues };
    }
    return {
      ok: true,
      field: {
        kind: 'file',
        ...read.base,
        multiple: multiple === true,
        rules: omitUndefined(read.rules),
      },
      warnings: read.warnings,
    };
  },

  valueSchema(field) {
    const { accept, maxBytes, maxFiles } = field.rules;
    const limit = field.multiple ? maxFiles : 1;

    return z.array(fileLike).superRefine((files, ctx) => {
      if (files.length === 0) {
        if (field.required) ctx.addIssue({ code: 'custom', message: 'required' });
        return;
      }
      if (limit !== undefined && files.length > limit) {
        ctx.addIssue({ code: 'custom', message: 'too_many_files', params: { max: limit } });
      }
      files.forEach((file, index) => {
        if (accept !== undefined && !acceptMatches(file, accept)) {
          ctx.addIssue({
            code: 'custom',
            message: 'file_type',
            path: [index],
            params: { file: file.name, accept: accept.join(', ') },
          });
        }
        if (maxBytes !== undefined && file.size > maxBytes) {
          ctx.addIssue({
            code: 'custom',
            message: 'file_too_large',
            path: [index],
            params: { file: file.name, maxBytes },
          });
        }
      });
    });
  },

  // A new list each time: form state must never share one array between two forms.
  defaultValue: (): FieldValue => [],

  // One part per file under the field name (the repeated-key convention); no files, no part.
  appendTo(field, value, body) {
    if (!Array.isArray(value)) return;
    for (const file of value) body.append(field.name, file);
  },
});
