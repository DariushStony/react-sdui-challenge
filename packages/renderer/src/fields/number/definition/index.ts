import { z } from 'zod';
import { parseNumber } from '../../../core/digits/parse-number';
import { toAsciiDigits } from '../../../core/digits/to-ascii-digits';
import type { Issue } from '../../../core/issues/issue';
import { defineKind } from '../../../core/kind/define-kind';
import { readLegacyBase } from '../../../core/legacy/read-legacy-base';
import type { NumberField } from '../../../core/model/number-field';
import { readV2 } from '../../../core/v2/read-v2';
import { isRecord } from '../../../core/wire/is-record';
import { omitUndefined } from '../../../core/wire/omit-undefined';

const numberRules = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  integer: z.boolean().optional(),
});

type LegacyBound = { ok: true; value: number | undefined } | { ok: false; issue: Issue };

// Legacy bounds are strings ("1900"); a number is accepted too. Anything else is a payload problem
// that must be reported, not guessed at.
function legacyBound(value: unknown, path: string): LegacyBound {
  if (value === undefined) return { ok: true, value: undefined };
  if (typeof value === 'number' && Number.isFinite(value)) return { ok: true, value };
  const parsed = typeof value === 'string' ? parseNumber(value) : { ok: false as const };
  if (parsed.ok) return { ok: true, value: parsed.value };
  return {
    ok: false,
    issue: { path, code: 'invalid_value', message: `${path} must be a number or a numeric string` },
  };
}

const numberDefinition = defineKind<NumberField>({
  kind: 'number',

  // Both text and number are the legacy `input` type; `props.type: "number"` marks this one.
  fromLegacy(raw, path) {
    const rawProps = raw['props'];
    if (raw['type'] !== 'input' || !isRecord(rawProps) || rawProps['type'] !== 'number') {
      return 'not-mine';
    }

    const read = readLegacyBase(raw, path);
    if (!read.ok) return read;

    const min = legacyBound(read.props['min'], `${path}.props.min`);
    const max = legacyBound(read.props['max'], `${path}.props.max`);
    const issues = [min, max].flatMap((bound) => (bound.ok ? [] : [bound.issue]));
    if (!min.ok || !max.ok) return { ok: false, issues };

    return {
      ok: true,
      field: {
        kind: 'number',
        ...read.base,
        rules: omitUndefined({ min: min.value, max: max.value }),
      },
      warnings: [],
    };
  },

  fromV2(raw, path) {
    const read = readV2(raw, path, numberRules);
    if (!read.ok) return read;
    return {
      ok: true,
      field: { kind: 'number', ...read.base, rules: omitUndefined(read.rules) },
      warnings: read.warnings,
    };
  },

  valueSchema(field) {
    return z.string().superRefine((raw, ctx) => {
      const text = raw.trim();
      if (text === '') {
        if (field.required) ctx.addIssue({ code: 'custom', message: 'required' });
        return;
      }
      const parsed = parseNumber(text);
      if (!parsed.ok) {
        ctx.addIssue({ code: 'custom', message: 'not_a_number' });
        return;
      }
      const { min, max, integer } = field.rules;
      if (integer === true && !Number.isInteger(parsed.value)) {
        ctx.addIssue({ code: 'custom', message: 'not_an_integer' });
      }
      if (min !== undefined && parsed.value < min) {
        ctx.addIssue({ code: 'custom', message: 'too_small', params: { min } });
      }
      if (max !== undefined && parsed.value > max) {
        ctx.addIssue({ code: 'custom', message: 'too_big', params: { max } });
      }
    });
  },

  defaultValue: (field) => field.defaultValue ?? '',

  // The typed text may use Persian digits; the server always receives ASCII (PRD FR-15).
  appendTo(field, value, body) {
    body.append(field.name, typeof value === 'string' ? toAsciiDigits(value).trim() : '');
  },
});

export { numberDefinition };
