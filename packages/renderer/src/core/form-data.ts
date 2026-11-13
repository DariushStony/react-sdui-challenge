import type { KindDefinition } from './kind';
import type { FormModel, FormValues } from './model';

/**
 * Builds the multipart body for a submission: each field, in the order of the form, adds its own
 * parts (ADR-0006). The caller sends it with `fetch` and no `Content-Type` header so the browser
 * adds the multipart boundary itself.
 *
 * A field with no definition is a programming error (the model came from the same list), so this
 * throws rather than silently sending a form with a part missing.
 */
export function buildFormData(
  model: FormModel,
  values: FormValues,
  definitions: readonly KindDefinition[],
): FormData {
  const byKind = new Map<string, KindDefinition>(
    definitions.map((definition) => [definition.kind, definition]),
  );
  const body = new FormData();
  for (const field of model.fields) {
    const definition = byKind.get(field.kind);
    if (definition === undefined) {
      throw new Error(`No definition for the "${field.kind}" kind of field "${field.name}"`);
    }
    definition.appendTo(field, values[field.name] ?? definition.defaultValue(field), body);
  }
  return body;
}
