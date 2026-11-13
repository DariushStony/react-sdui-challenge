import type { FileListProps } from '../../ui-kit/props/file-list-props';
import { Button } from '../button';
import styles from './styles.module.css';

/** The files chosen so far, each with a thumbnail (if it has one), a size and a remove button. */
function FileList({ items, removeLabel, removeText, disabled, onRemove }: FileListProps) {
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

export { FileList };
