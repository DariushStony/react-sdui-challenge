// The public API of the renderer: everything an integrator may import is listed here, and the
// package's `exports` map makes nothing else reachable (ADR-0014).

// The form
export { DynamicForm } from './engine/DynamicForm';
export type { DynamicFormProps } from './engine/DynamicForm';
export type { SubmitOutcome } from './engine/outcome';
export { buildValuesSchema } from './engine/build-values-schema';

// Giving the form a design system and a language (ADR-0015)
export { DynamicFormProvider } from './provider/dynamic-form-provider';
export { useMessages } from './provider/use-messages';
export { useUiKit } from './provider/use-ui-kit';
export { createTranslator } from './i18n/create-translator';
export { enMessages } from './i18n/en-messages';
export { faMessages } from './i18n/fa-messages';
export type { Messages } from './i18n/messages';
export type { Translator } from './i18n/translator';
export { getDirection, setDocumentDirection } from './i18n/direction';
export type { Direction } from './i18n/direction';

// The UI kit contract, and the default kit that implements it
export { describedBy, fieldIds } from './ui-kit';
export type * from './ui-kit';
export {
  Alert,
  Button,
  Field,
  FileList,
  FilePicker,
  Form,
  FormActions,
  Select,
  TextArea,
  TextInput,
  VisuallyHidden,
  defaultUiKit,
} from './default-kit';

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
