import type { ComponentType } from 'react';
import type {
  AlertProps,
  ButtonProps,
  FieldProps,
  FileListProps,
  FilePickerProps,
  FormActionsProps,
  FormProps,
  SelectProps,
  TextAreaProps,
  TextInputProps,
  VisuallyHiddenProps,
} from './props';

/**
 * The visual pieces the form engine and the field components use. A host with its own design system
 * implements this (an Adapter: its components mapped onto these props) and passes it to
 * `DynamicFormProvider`; without one, the library's default kit is used (ADR-0015).
 */
export type UiKit = {
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
