import type { Issue, ParseResult, RejectionReason } from './issues';
import type { KindDefinition } from './kind';
import type { FieldModel } from './model';
import { isRecord, omitUndefined, type Raw } from './wire';

/** The highest `schemaVersion` this client can read. A higher one is refused, not guessed at. */
export const SUPPORTED_SCHEMA_VERSION = 2;

type Outcome =
  | { readonly type: 'field'; readonly field: FieldModel; readonly warnings: readonly Issue[] }
  | { readonly type: 'invalid'; readonly issues: readonly Issue[] }
  | {
      readonly type: 'unknown';
      readonly name: string;
      readonly required: boolean;
      readonly what: string;
    };

const issue = (path: string, code: string, message: string): Issue => ({ path, code, message });

function readVersion(
  value: unknown,
): { ok: true; version: number } | { ok: false; issues: Issue[] } {
  if (value === undefined) return { ok: true, version: 1 };
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1)
    return { ok: true, version: value };
  return {
    ok: false,
    issues: [
      issue('schemaVersion', 'invalid_value', 'schemaVersion must be a whole number of 1 or more'),
    ],
  };
}

const nameOf = (item: Raw): string =>
  typeof item['name'] === 'string' ? item['name'] : '(unnamed)';

// The legacy shape has no way to say "required"; an explicit boolean is read when it is there.
const legacyRequired = (item: Raw): boolean =>
  item['required'] === true || (isRecord(item['props']) && item['props']['required'] === true);

const v2Required = (item: Raw): boolean =>
  isRecord(item['rules']) && item['rules']['required'] === true;

/**
 * Builds the one function that turns any payload into the canonical model (ADR-0001). It knows no
 * field kind by name: it only uses the definitions it is given (ADR-0002), so adding a kind never
 * means editing it. `normalize(raw, formId)` never throws; it returns a model or a typed rejection.
 */
export function createNormalizer(definitions: readonly KindDefinition[]) {
  const byKind = new Map<string, KindDefinition>(
    definitions.map((definition) => [definition.kind, definition]),
  );

  function readLegacyField(item: Raw, path: string): Outcome {
    for (const definition of definitions) {
      const result = definition.fromLegacy?.(item, path);
      if (result === undefined || result === 'not-mine') continue;
      return result.ok
        ? { type: 'field', field: result.field, warnings: result.warnings }
        : { type: 'invalid', issues: result.issues };
    }
    return {
      type: 'unknown',
      name: nameOf(item),
      required: legacyRequired(item),
      what: `type "${String(item['type'])}"`,
    };
  }

  function readV2Field(item: Raw, path: string): Outcome {
    const kind = item['kind'];
    if (typeof kind !== 'string') {
      return {
        type: 'invalid',
        issues: [issue(`${path}.kind`, 'invalid_value', 'kind must be a string')],
      };
    }
    const definition = byKind.get(kind);
    if (definition === undefined) {
      return {
        type: 'unknown',
        name: nameOf(item),
        required: v2Required(item),
        what: `kind "${kind}"`,
      };
    }
    const result = definition.fromV2(item, path);
    return result.ok
      ? { type: 'field', field: result.field, warnings: result.warnings }
      : { type: 'invalid', issues: result.issues };
  }

  const reject = (reason: RejectionReason, issues: readonly Issue[]): ParseResult => ({
    ok: false,
    reason,
    issues,
  });

  return function normalize(raw: unknown, formId: string): ParseResult {
    if (!isRecord(raw)) {
      return reject('invalid', [issue('', 'invalid_payload', 'The payload must be a JSON object')]);
    }
    const rawFields = raw['fields'];
    if (!Array.isArray(rawFields)) {
      return reject('invalid', [issue('fields', 'invalid_value', 'fields must be a list')]);
    }
    const versionRead = readVersion(raw['schemaVersion']);
    if (!versionRead.ok) return reject('invalid', versionRead.issues);
    const { version } = versionRead;
    if (version > SUPPORTED_SCHEMA_VERSION) {
      return reject('outdated', [
        issue(
          'schemaVersion',
          'unsupported_version',
          `schemaVersion ${version} is newer than the supported ${SUPPORTED_SCHEMA_VERSION}`,
        ),
      ]);
    }

    const parsed: { field: FieldModel; path: string }[] = [];
    const warnings: Issue[] = [];
    const invalid: Issue[] = [];
    const unknownRequired: Issue[] = [];

    rawFields.forEach((item: unknown, index) => {
      const path = `fields[${index}]`;
      if (!isRecord(item)) {
        invalid.push(issue(path, 'invalid_value', 'a field must be an object'));
        return;
      }
      const outcome = version === 1 ? readLegacyField(item, path) : readV2Field(item, path);
      if (outcome.type === 'field') {
        parsed.push({ field: outcome.field, path });
        warnings.push(...outcome.warnings);
      } else if (outcome.type === 'invalid') {
        invalid.push(...outcome.issues);
      } else if (outcome.required) {
        unknownRequired.push(
          issue(
            path,
            'unknown_required_kind',
            `Required field "${outcome.name}" has a ${outcome.what} this client does not support`,
          ),
        );
      } else {
        warnings.push(
          issue(path, 'unknown_kind', `Skipped field "${outcome.name}" of unknown ${outcome.what}`),
        );
      }
    });

    // One reason per rejection, most fundamental first: a malformed field, then a field we cannot
    // render but must not drop, then a name clash.
    if (invalid.length > 0) return reject('invalid', invalid);
    if (unknownRequired.length > 0) return reject('unknown-required-kind', unknownRequired);

    const seen = new Set<string>();
    const duplicates: Issue[] = [];
    for (const { field, path } of parsed) {
      if (seen.has(field.name)) {
        duplicates.push(issue(path, 'duplicate_name', `Two fields are named "${field.name}"`));
      }
      seen.add(field.name);
    }
    if (duplicates.length > 0) return reject('duplicate-name', duplicates);

    return {
      ok: true,
      model: {
        formId,
        schemaVersion: version === 1 ? 1 : 2,
        ...omitUndefined({ title: typeof raw['title'] === 'string' ? raw['title'] : undefined }),
        fields: parsed.map(({ field }) => field),
      },
      warnings,
    };
  };
}
