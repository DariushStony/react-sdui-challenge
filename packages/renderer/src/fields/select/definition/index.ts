import { z } from 'zod';
import type { Issue } from '../../../core/issues/issue';
import { defineKind } from '../../../core/kind/define-kind';
import { readLegacyBase } from '../../../core/legacy/read-legacy-base';
import type { SelectField } from '../../../core/model/select-field';
import { readV2 } from '../../../core/v2/read-v2';
import { isRecord } from '../../../core/wire/is-record';
import { zodIssues } from '../../../core/wire/zod-issues';

type Options = SelectField['options'];

const v2Options = z.array(z.object({ value: z.string(), label: z.string() }));

const noRules = z.object({});

type LegacyOptions = { ok: true; options: Options } | { ok: false; issues: Issue[] };

// Legacy option values are strings in the brief's sample; a number is tolerated and read as text
// because a submitted value is text either way.
function legacyOptions(value: unknown, path: string): LegacyOptions {
  if (!Array.isArray(value)) {
    return {
      ok: false,
      issues: [{ path, code: 'invalid_value', message: 'options must be a list' }],
    };
  }
  const issues: Issue[] = [];
  const options: { value: string; label: string }[] = [];
  value.forEach((item: unknown, index) => {
    const option = isRecord(item) ? item : undefined;
    const optionValue = option?.['value'];
    const label = option?.['label'];
    if (
      typeof label === 'string' &&
      (typeof optionValue === 'string' || typeof optionValue === 'number')
    ) {
      options.push({ value: String(optionValue), label });
    } else {
      issues.push({
        path: `${path}[${index}]`,
        code: 'invalid_value',
        message: 'an option needs a text label and a text or number value',
      });
    }
  });
  return issues.length > 0 ? { ok: false, issues } : { ok: true, options };
}

const selectDefinition = defineKind<SelectField>({
  kind: 'select',

  fromLegacy(raw, path) {
    if (raw['type'] !== 'select') return 'not-mine';
    const read = readLegacyBase(raw, path);
    if (!read.ok) return read;
    const options = legacyOptions(read.props['options'], `${path}.props.options`);
    if (!options.ok) return options;
    return {
      ok: true,
      field: { kind: 'select', ...read.base, options: options.options },
      warnings: [],
    };
  },

  fromV2(raw, path) {
    const read = readV2(raw, path, noRules, ['options']);
    const options = v2Options.safeParse(raw['options']);
    if (!read.ok || !options.success) {
      return {
        ok: false,
        issues: [
          ...(read.ok ? [] : read.issues),
          ...(options.success ? [] : zodIssues(options.error, `${path}.options`)),
        ],
      };
    }
    return {
      ok: true,
      field: { kind: 'select', ...read.base, options: options.data },
      warnings: read.warnings,
    };
  },

  valueSchema(field) {
    return z.string().superRefine((value, ctx) => {
      if (value === '') {
        if (field.required) ctx.addIssue({ code: 'custom', message: 'required' });
        return;
      }
      if (!field.options.some((option) => option.value === value)) {
        ctx.addIssue({ code: 'custom', message: 'not_an_option' });
      }
    });
  },

  defaultValue: (field) => field.defaultValue ?? '',

  appendTo(field, value, body) {
    body.append(field.name, typeof value === 'string' ? value : '');
  },
});

export { selectDefinition };
