import { z } from 'zod';
import { compilePattern } from '../../../core/pattern';
import { readV2 } from '../../../core/v2/read-v2';
import { omitUndefined } from '../../../core/wire/omit-undefined';
import { type Raw } from '../../../core/wire/raw';
import type { StringV2 } from '../string-v2';

const stringRules = z.object({
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(0).optional(),
  pattern: z.string().optional(),
});

function readStringV2(raw: Raw, path: string): StringV2 {
  const read = readV2(raw, path, stringRules);
  if (!read.ok) return read;

  const { pattern, ...lengths } = read.rules;
  const warnings = [...read.warnings];
  // A pattern that cannot compile is dropped here so it never reaches rendering (NFR-08).
  const usablePattern =
    pattern !== undefined && compilePattern(pattern) === null ? undefined : pattern;
  if (pattern !== undefined && usablePattern === undefined) {
    warnings.push({
      path: `${path}.rules.pattern`,
      code: 'invalid_pattern',
      message: `Ignored a pattern that does not compile: ${pattern}`,
    });
  }
  return {
    ok: true,
    base: read.base,
    rules: omitUndefined({ ...lengths, pattern: usablePattern }),
    warnings,
  };
}

export { readStringV2 };
