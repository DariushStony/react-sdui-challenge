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
  /** The ids of the hint and the error, for `aria-describedby` on the button. */
  describedBy?: string | undefined;
  onFiles: (files: File[]) => void;
  /** Called when the button loses focus, so the form can start checking the field. */
  onBlur?: (() => void) | undefined;
  /**
   * The visible button. The engine focuses it when this is the first invalid field, and the field
   * focuses it again after a file is removed, so it must receive the ref.
   */
  buttonRef?: Ref<HTMLButtonElement> | undefined;
};

export type { FilePickerProps };
