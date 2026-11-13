// The public API of the renderer: everything an integrator may import is listed here, and the
// package's `exports` map makes nothing else reachable (ADR-0014).

// The form
export { DynamicForm } from './engine/DynamicForm';
export type { DynamicFormProps } from './engine/DynamicForm';
export type { SubmitOutcome } from './engine/outcome';
export { buildValuesSchema } from './engine/build-values-schema';
export {
  RejectionAlert,
  TechnicalDetails,
  WarningsAlert,
  describeIssue,
} from './engine/Diagnostics';

// Turning a payload into a model, and a model into a request
export { createNormalizer } from './core/normalize';
export type { Normalizer } from './core/normalize';
export { buildFormData } from './core/form-data';
export { parseServerErrors } from './core/server-errors';
export { toFieldErrors } from './core/field-errors';

// Field kinds: the registry and how to add one
export { FIELD_DEFINITIONS, normalize } from './fields/definitions';
export { FIELD_KINDS, defineFieldKind } from './fields';
export type { FieldKind } from './fields';
export { defineKind } from './core/kind';
export type { FieldParse, KindDefinition, LegacyParse } from './core/kind';

// The canonical model and the shapes around it
export type {
  FieldModel,
  FieldSize,
  FieldValue,
  FileField,
  FormModel,
  FormValues,
  NumberField,
  SelectField,
  TextField,
  TextareaField,
} from './core/model';
export type { FieldError, Issue, ParseResult, RejectionReason, ServerErrors } from './core/issues';

// Text and direction
export { t, describeError } from './i18n/t';
export { getDirection, setDocumentDirection } from './i18n/direction';
export type { Direction } from './i18n/direction';

// The default design-system components
export * from './ui';
