import type { FileListItem } from '../file-list-item';

type FileListProps = {
  items: readonly FileListItem[];
  /** The remove button's accessible name for a file, so it says which file it removes. */
  removeLabel: (name: string) => string;
  /** The visible word on the remove button; it must also appear in `removeLabel`'s text. */
  removeText: string;
  /** Disables every remove button, for a field that is disabled or read-only. */
  disabled?: boolean | undefined;
  onRemove: (key: string) => void;
};

export type { FileListProps };
