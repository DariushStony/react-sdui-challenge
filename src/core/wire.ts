import type { z } from 'zod';
import type { Issue } from './issues';
import type { FieldSize } from './model';

// Small helpers shared by every kind while it turns a raw payload object into the canonical model.

export type Raw = Readonly<Record<string, unknown>>;

export function isRecord(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// react-hook-form silently ignores these names, so the input would accept no keystrokes.
const RESERVED_NAMES = new Set(['constructor', 'prototype', '__proto__']);

/**
 * A field name is also a multipart part name and a react-hook-form path. The form reads "." and
 * "[" / "]" as path separators ("a.b" becomes a nested value) and drops quotes from a path, so such
 * a name could never round-trip. Spaces are fine: the form keeps them as part of the key.
 */
export function isSafeFieldName(name: string): boolean {
  return name !== '' && !/[.[\]'"]/.test(name) && !RESERVED_NAMES.has(name);
}

// Code points, not literals: the ASCII colon and the full-width colon look alike in an editor.
const COLON_CODE_POINTS = new Set([0x003a, 0xff1a]);

/** Drops the label's one trailing colon (legacy labels end with ":"); the design adds its own. */
export function stripTrailingColon(label: string): string {
  const trimmed = label.trim();
  const last = Array.from(trimmed).at(-1);
  if (last !== undefined && COLON_CODE_POINTS.has(last.codePointAt(0) ?? -1)) {
    return trimmed.slice(0, -last.length).trim();
  }
  return trimmed;
}

const SIZE_TOKENS: readonly FieldSize[] = ['small', 'medium', 'large'];

/** A server size hint is only ever a token name; anything else is dropped (PRD FR-14). */
export function sizeToken(value: unknown): FieldSize | undefined {
  return SIZE_TOKENS.find((token) => token === value);
}

/** One warning per key the client does not know; the key is ignored, the form still renders. */
export function unknownKeyWarnings(raw: Raw, known: readonly string[], path: string): Issue[] {
  return Object.keys(raw)
    .filter((key) => !known.includes(key))
    .map((key) => ({
      path: `${path}.${key}`,
      code: 'unknown_key',
      message: `Ignored unknown key "${key}"`,
    }));
}

type Defined<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
} & {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
};

/**
 * Removes keys whose value is undefined. The model's optional properties are declared without
 * `| undefined` (exactOptionalPropertyTypes), so a parsed optional value must be left out, not set
 * to undefined. The one cast is safe because the filter and the type say the same thing.
 */
export function omitUndefined<T extends Record<string, unknown>>(value: T): Defined<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as Defined<T>;
}

/** Turns a zod failure into developer-facing issues whose paths are relative to the whole payload. */
export function zodIssues(error: z.ZodError, path: string): Issue[] {
  return error.issues.map((issue) => ({
    path:
      path +
      issue.path
        .map((segment) => (typeof segment === 'number' ? `[${segment}]` : `.${String(segment)}`))
        .join(''),
    code: 'invalid_value',
    message: issue.message,
  }));
}
