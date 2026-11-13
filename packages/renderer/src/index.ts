// The public API of the renderer: everything an integrator may import is listed here, and the
// package's `exports` map makes nothing else reachable (ADR-0014).

// The form
export { DynamicForm } from './engine/dynamic-form/dynamic-form';
export type { DynamicFormProps } from './engine/dynamic-form/dynamic-form-props';
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
export { getDirection } from './i18n/direction/get-direction';
export { setDocumentDirection } from './i18n/direction/set-document-direction';
export type { Direction } from './i18n/direction/direction';

// The UI kit contract, and the default kit that implements it
export { describedBy } from './ui-kit/described-by';
export { fieldIds } from './ui-kit/field-ids';
export type { ControlSize } from './ui-kit/props/control-size';
export type { AlertProps } from './ui-kit/props/alert-props';
export type { ButtonProps } from './ui-kit/props/button-props';
export type { FieldProps } from './ui-kit/props/field-props';
export type { FileListItem } from './ui-kit/props/file-list-item';
export type { FileListProps } from './ui-kit/props/file-list-props';
export type { FilePickerProps } from './ui-kit/props/file-picker-props';
export type { SelectProps } from './ui-kit/props/select-props';
export type { TextAreaProps } from './ui-kit/props/text-area-props';
export type { TextInputProps } from './ui-kit/props/text-input-props';
export type { FormProps } from './ui-kit/props/form-props';
export type { FormActionsProps } from './ui-kit/props/form-actions-props';
export type { VisuallyHiddenProps } from './ui-kit/props/visually-hidden-props';
export type { UiKit } from './ui-kit/ui-kit';
export { Alert } from './default-kit/alert';
export { Button } from './default-kit/button';
export { Field } from './default-kit/field';
export { FileList } from './default-kit/file-list';
export { FilePicker } from './default-kit/file-picker';
export { Form } from './default-kit/form/form';
export { FormActions } from './default-kit/form/form-actions';
export { Select } from './default-kit/select';
export { TextArea } from './default-kit/text-area';
export { TextInput } from './default-kit/text-input';
export { VisuallyHidden } from './default-kit/visually-hidden';
export { defaultUiKit } from './default-kit/default-ui-kit';

// Turning a payload into a model, and a model into a request
export { createNormalizer } from './core/normalize/create-normalizer';
export type { Normalizer } from './core/normalize/normalizer';
export { buildFormData } from './core/form-data';
export { parseServerErrors } from './core/server-errors';
export { toFieldErrors } from './core/field-errors/to-field-errors';

// Field kinds: the registry and how to add one
export { FIELD_DEFINITIONS } from './fields/definitions/field-definitions';
export { normalize } from './fields/definitions/normalize';
export { FIELD_KINDS } from './fields/field-kinds';
export { defineFieldKind } from './fields/define-field-kind/define-field-kind';
export type { FieldKind } from './fields/define-field-kind/field-kind';
export { defineKind } from './core/kind/define-kind';
export type { FieldParse } from './core/kind/field-parse';
export type { KindDefinition } from './core/kind/kind-definition';
export type { LegacyParse } from './core/kind/legacy-parse';

// The canonical model and the shapes around it
export type { FieldModel } from './core/model/field-model';
export type { FieldSize } from './core/model/field-size';
export type { FieldValue } from './core/model/field-value';
export type { FileField } from './core/model/file-field';
export type { FormModel } from './core/model/form-model';
export type { FormValues } from './core/model/form-values';
export type { NumberField } from './core/model/number-field';
export type { SelectField } from './core/model/select-field';
export type { TextField } from './core/model/text-field';
export type { TextareaField } from './core/model/textarea-field';
export type { FieldError } from './core/issues/field-error';
export type { Issue } from './core/issues/issue';
export type { ParseResult } from './core/issues/parse-result';
export type { RejectionReason } from './core/issues/rejection-reason';
export type { ServerErrors } from './core/issues/server-errors';
