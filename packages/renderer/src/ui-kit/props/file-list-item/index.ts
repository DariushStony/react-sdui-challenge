type FileListItem = {
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

export type { FileListItem };
