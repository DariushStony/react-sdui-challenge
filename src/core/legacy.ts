import type { Issue } from './issues';
import type { FieldSize } from './model';
import {
  isRecord,
  isSafeFieldName,
  omitUndefined,
  sizeToken,
  stripTrailingColon,
  type Raw,
} from './wire';

export type LegacyBase = {
  readonly name: string;
  readonly label: string;
  readonly required: boolean;
  readonly placeholder?: string;
  readonly size?: FieldSize;
};

export type LegacyRead =
  | { readonly ok: true; readonly props: Raw; readonly base: LegacyBase }
  | { readonly ok: false; readonly issues: readonly Issue[] };

const invalid = (path: string, message: string): Issue => ({
  path,
  code: 'invalid_value',
  message,
});

/**
 * Reads what every legacy field has in common. Colors, inline styles and spacing are never read:
 * presentation belongs to the design system, not the server (PRD FR-14).
 *
 * The brief's sample has no way to say "required", so a field is required only when it carries an
 * explicit boolean `required` (on the field or in `props`). That is tolerance, not part of the brief.
 */
export function readLegacyBase(raw: Raw, path: string): LegacyRead {
  const issues: Issue[] = [];

  const name =
    typeof raw['name'] === 'string' && isSafeFieldName(raw['name']) ? raw['name'] : undefined;
  if (name === undefined) {
    issues.push(invalid(`${path}.name`, 'name must be text without ".", "[" or "]"'));
  }

  const label = typeof raw['label'] === 'string' ? raw['label'] : undefined;
  if (label === undefined) issues.push(invalid(`${path}.label`, 'label must be a string'));

  const rawProps = raw['props'];
  const props = rawProps === undefined ? {} : isRecord(rawProps) ? rawProps : undefined;
  if (props === undefined) issues.push(invalid(`${path}.props`, 'props must be an object'));

  if (name === undefined || label === undefined || props === undefined)
    return { ok: false, issues };

  const placeholder = props['placeholder'];
  return {
    ok: true,
    props,
    base: {
      name,
      label: stripTrailingColon(label),
      required: raw['required'] === true || props['required'] === true,
      ...omitUndefined({
        placeholder: typeof placeholder === 'string' ? placeholder : undefined,
        size: sizeToken(props['size']),
      }),
    },
  };
}
