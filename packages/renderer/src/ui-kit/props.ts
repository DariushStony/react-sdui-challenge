import type { ComponentPropsWithRef, ReactNode, Ref } from 'react';

// The contract between the renderer and a design system (ADR-0015). The engine and the field
// components render through these props only; any kit that implements them can replace the default.

/** The size tokens a control understands. The form engine maps a server size hint onto these. */
export type ControlSize = 'small' | 'medium' | 'large';

export type AlertProps = {
  tone: 'error' | 'success' | 'info';
  title?: string | undefined;
  /** For example a Retry button. */
  action?: ReactNode;
  /** Lets code move focus here, for example to announce a success (ADR-0010). */
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
};

export type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'type'> & {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  /** While busy the button ignores clicks and submits, but stays focusable (PRD FR-31). */
  busy?: boolean | undefined;
};

export type FieldProps = {
  /** The id of the control inside; the label and the ids of the hint and the error derive from it. */
  id: string;
  label: string;
  required?: boolean | undefined;
  description?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
};

export type FileListItem = {
  /** Identifies the file to `onRemove`; the app chooses it. */
  readonly key: string;
  readonly name: string;
  /** Already formatted for display, for example "۵ مگابایت". */
  readonly sizeLabel: string;
  /** An address for a thumbnail; items without one show no image. */
  readonly previewUrl?: string | undefined;
  /** Marks a file that has a problem, so it stands out in the list. */
  readonly invalid?: boolean | undefined;
};

export type FileListProps = {
  items: readonly FileListItem[];
  /** The remove button's accessible name for a file, so it says which file it removes. */
  removeLabel: (name: string) => string;
  /** The visible word on the remove button; it must also appear in `removeLabel`'s text. */
  removeText: string;
  /** Disables every remove button, for a field that is disabled or read-only. */
  disabled?: boolean | undefined;
  onRemove: (key: string) => void;
};

export type FilePickerProps = {
  /**
   * The id of the native input behind the button, which a field's label points at: clicking the
   * label opens the file dialog. The visible button gets `${id}-button`.
   */
  id: string;
  /** The id of the element that names the field (its label). */
  labelledBy: string;
  buttonLabel: string;
  /** A short sentence about what is chosen, announced politely whenever it changes. */
  status: string;
  accept?: string | undefined;
  multiple?: boolean | undefined;
  disabled?: boolean | undefined;
  describedBy?: string | undefined;
  onFiles: (files: File[]) => void;
  onBlur?: (() => void) | undefined;
  buttonRef?: Ref<HTMLButtonElement> | undefined;
};

export type SelectProps = Omit<ComponentPropsWithRef<'select'>, 'size'> & {
  invalid?: boolean | undefined;
  size?: ControlSize | undefined;
};

export type TextAreaProps = ComponentPropsWithRef<'textarea'> & {
  invalid?: boolean | undefined;
  size?: ControlSize | undefined;
};

export type TextInputProps = Omit<ComponentPropsWithRef<'input'>, 'size'> & {
  invalid?: boolean | undefined;
  size?: ControlSize | undefined;
};

/** The form container. Validation is the app's job, so a kit should switch the browser's own bubbles off. */
export type FormProps = ComponentPropsWithRef<'form'>;

/** A row for the form's buttons. */
export type FormActionsProps = { children: ReactNode };

/**
 * Text that is not drawn but is read by screen readers. With `live` it is a polite live region, for
 * a status that changes (for example "sending") that a sighted person sees in another way.
 */
export type VisuallyHiddenProps = { children: ReactNode; live?: boolean };
