import type { Ref } from 'react';

type FilePickerProps = {
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

export type { FilePickerProps };
