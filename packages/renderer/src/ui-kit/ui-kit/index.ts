import type { ComponentType } from 'react';
import type { AlertProps } from '../props/alert-props';
import type { ButtonProps } from '../props/button-props';
import type { FieldProps } from '../props/field-props';
import type { FileListProps } from '../props/file-list-props';
import type { FilePickerProps } from '../props/file-picker-props';
import type { FormActionsProps } from '../props/form-actions-props';
import type { FormProps } from '../props/form-props';
import type { SelectProps } from '../props/select-props';
import type { TextAreaProps } from '../props/text-area-props';
import type { TextInputProps } from '../props/text-input-props';
import type { VisuallyHiddenProps } from '../props/visually-hidden-props';

/**
 * The visual pieces the form engine and the field components use. A host with its own design system
 * implements this (an Adapter: its components mapped onto these props) and passes it to
 * `DynamicFormProvider`; without one, the library's default kit is used (ADR-0015).
 */
type UiKit = {
  readonly Alert: ComponentType<AlertProps>;
  readonly Button: ComponentType<ButtonProps>;
  readonly Field: ComponentType<FieldProps>;
  readonly FileList: ComponentType<FileListProps>;
  readonly FilePicker: ComponentType<FilePickerProps>;
  readonly Form: ComponentType<FormProps>;
  readonly FormActions: ComponentType<FormActionsProps>;
  readonly Select: ComponentType<SelectProps>;
  readonly TextArea: ComponentType<TextAreaProps>;
  readonly TextInput: ComponentType<TextInputProps>;
  readonly VisuallyHidden: ComponentType<VisuallyHiddenProps>;
};

export type { UiKit };
