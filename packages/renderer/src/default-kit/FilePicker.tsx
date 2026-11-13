import { useRef } from 'react';
import type { FilePickerProps } from '../ui-kit';
import { Button } from './Button';
import styles from './FilePicker.module.css';

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
