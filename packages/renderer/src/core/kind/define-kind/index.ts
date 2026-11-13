import type { FieldModel } from '../../model/field-model';
import type { KindDefinition } from '../kind-definition';

/**
 * Widens a definition for one field type into the shared `KindDefinition` the registry stores.
 * A field of another kind is a programming error, so it throws instead of being checked with the
 * wrong rules.
 */
function defineKind<F extends FieldModel>(definition: KindDefinition<F>): KindDefinition {
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

export { defineKind };
