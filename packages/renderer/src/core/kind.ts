import type { z } from 'zod';
import type { Issue } from './issues';
import type { FieldModel, FieldValue } from './model';
import type { Raw } from './wire';

export type FieldParse<F extends FieldModel> =
  | { readonly ok: true; readonly field: F; readonly warnings: readonly Issue[] }
  | { readonly ok: false; readonly issues: readonly Issue[] };

/** `'not-mine'` lets several kinds share one legacy `type` (text and number are both "input"). */
export type LegacyParse<F extends FieldModel> = 'not-mine' | FieldParse<F>;

/**
 * Everything the pure side of a field kind needs to know (ADR-0002). It has no React in it, so it
 * runs in a plain Node test; the component for the kind lives next to it in `fields/<kind>/`.
 */
export interface KindDefinition<F extends FieldModel = FieldModel> {
  readonly kind: F['kind'];
  /** Reads a legacy-shaped field. Absent for kinds the legacy shape cannot express. */
  readonly fromLegacy?: (raw: Raw, path: string) => LegacyParse<F>;
  readonly fromV2: (raw: Raw, path: string) => FieldParse<F>;
  /** Validation as data: failures carry a message code and params (see `toFieldErrors`). */
  readonly valueSchema: (field: F) => z.ZodType<FieldValue>;
  readonly defaultValue: (field: F) => FieldValue;
  /** Adds this field's parts to the multipart body. */
  readonly appendTo: (field: F, value: FieldValue, body: FormData) => void;
}

/**
 * Widens a definition for one field type into the shared `KindDefinition` the registry stores.
 * A field of another kind is a programming error, so it throws instead of being checked with the
 * wrong rules.
 */
export function defineKind<F extends FieldModel>(definition: KindDefinition<F>): KindDefinition {
  const owns = (field: FieldModel): field is F => field.kind === definition.kind;
  const own = (field: FieldModel): F => {
    if (!owns(field)) {
      throw new Error(
        `Field "${field.name}" is a ${field.kind} field, but this definition handles ${definition.kind}.`,
      );
    }
    return field;
  };

  return {
    kind: definition.kind,
    ...(definition.fromLegacy ? { fromLegacy: definition.fromLegacy } : {}),
    fromV2: definition.fromV2,
    valueSchema: (field) => definition.valueSchema(own(field)),
    defaultValue: (field) => definition.defaultValue(own(field)),
    appendTo: (field, value, body) => definition.appendTo(own(field), value, body),
  };
}
