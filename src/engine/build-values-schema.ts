import { z } from 'zod';
import type { KindDefinition } from '../core/kind';
import type { FieldValue, FormModel } from '../core/model';

/**
 * The validation of a whole form: one value schema per field, each built by the field's own kind and
 * keyed by the field name. Validation is data-driven, so the same schema serves the browser, the
 * tests and the playground (PRD FR-17).
 *
 * A field whose kind has no definition throws; skipping it would submit a field that was never checked.
 */
export function buildValuesSchema(model: FormModel, definitions: readonly KindDefinition[]) {
  const byKind = new Map<string, KindDefinition>(
    definitions.map((definition) => [definition.kind, definition]),
  );
  const shape: Record<string, z.ZodType<FieldValue>> = {};
  for (const field of model.fields) {
    const definition = byKind.get(field.kind);
    if (definition === undefined) {
      throw new Error(`No definition for the "${field.kind}" kind of field "${field.name}"`);
    }
    shape[field.name] = definition.valueSchema(field);
  }
  return z.object(shape);
}
