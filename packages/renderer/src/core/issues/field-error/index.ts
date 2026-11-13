/** A stable message code plus the values its text needs; Persian text is built at display time. */
type FieldError = {
  readonly code: string;
  readonly params?: Readonly<Record<string, string | number>>;
  /** Server-supplied fallback text, used only when the client has no text for the code. */
  readonly message?: string;
};

export type { FieldError };
