import type { z } from 'zod';
import type { FieldModel } from '../../model/field-model';
import type { FieldValue } from '../../model/field-value';
import type { Raw } from '../../wire/raw';
import type { LegacyParse } from '../legacy-parse';
import type { FieldParse } from '../field-parse';

/**
 * Everything the pure side of a field kind needs to know (ADR-0002). It has no React in it, so it
 * runs in a plain Node test; the component for the kind lives next to it in `fields/<kind>/`.
 */
interface KindDefinition<F extends FieldModel = FieldModel> {
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

export type { KindDefinition };
