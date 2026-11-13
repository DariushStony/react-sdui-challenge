/** A developer-facing finding about a payload (English; never shown to the form filler). */
type Issue = {
  /** Where in the payload, for example `fields[2].props.min`. */
  readonly path: string;
  readonly code: string;
  readonly message: string;
  /** The name of the field the finding is about, when there is one; the UI can show it. */
  readonly field?: string;
};

export type { Issue };
