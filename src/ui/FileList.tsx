import { Button } from './Button';
import styles from './FileList.module.css';

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

/** The files chosen so far, each with a thumbnail (if it has one), a size and a remove button. */
export function FileList({ items, removeLabel, removeText, disabled, onRemove }: FileListProps) {
  if (items.length === 0) return null;
  return (
    <ul className={styles['list']}>
      {items.map((item) => (
        <li
          key={item.key}
          className={styles['item']}
          data-invalid={item.invalid ? 'true' : undefined}
        >
          {/* Decorative: the name next to it already says what the file is. */}
          {item.previewUrl ? (
            <img className={styles['thumb']} src={item.previewUrl} alt="" />
          ) : null}
          <span className={styles['name']}>{item.name}</span>
          <span className={styles['size']}>{item.sizeLabel}</span>
          <Button
            variant="secondary"
            disabled={disabled}
            aria-label={removeLabel(item.name)}
            onClick={() => onRemove(item.key)}
          >
            {removeText}
          </Button>
        </li>
      ))}
    </ul>
  );
}
