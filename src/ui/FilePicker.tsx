import { useRef, type Ref } from 'react';
import { Button } from './Button';
import styles from './FilePicker.module.css';

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

/**
 * The control a person uses to choose files. It is a real button (so keyboard, focus and screen
 * reader behaviour are the platform's own) that opens a native file input kept hidden behind it.
 *
 * The button is named by the field label followed by its own text, so the words on screen are part
 * of the accessible name. (The label is attached to the hidden input, not to the button: a native
 * label on a button would replace the button's own text in some accessible-name implementations.) After each choice the input is cleared: otherwise choosing the same file
 * again, after removing it, would not fire a change event.
 */
export function FilePicker({
  id,
  labelledBy,
  buttonLabel,
  status,
  accept,
  multiple,
  disabled,
  describedBy,
  onFiles,
  onBlur,
  buttonRef,
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles['row']}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        hidden
        tabIndex={-1}
        multiple={multiple}
        accept={accept}
        // The field's label points here, so a disabled picker must disable this input too.
        disabled={disabled}
        onChange={(event) => {
          const input = event.currentTarget;
          // Copy first: clearing the input empties its FileList.
          const files = Array.from(input.files ?? []);
          input.value = '';
          if (files.length > 0) onFiles(files);
        }}
      />
      <Button
        id={`${id}-button`}
        ref={buttonRef}
        variant="secondary"
        aria-labelledby={`${labelledBy} ${id}-button`}
        aria-describedby={describedBy}
        disabled={disabled}
        onBlur={onBlur}
        onClick={() => inputRef.current?.click()}
      >
        {buttonLabel}
      </Button>
      <p aria-live="polite" className={styles['status']}>
        {status}
      </p>
    </div>
  );
}
