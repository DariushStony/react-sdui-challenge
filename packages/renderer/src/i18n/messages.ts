/**
 * The text a host gives the renderer: a locale (which decides how numbers are written) and a
 * catalog of message templates. `{name}` is replaced by a parameter; `{name|size}` shows a byte count
 * as a size. The library ships Persian and English; a host can pass its own (ADR-0015).
 */
type Messages = {
  readonly locale: string;
  readonly catalog: Readonly<Record<string, string>>;
};

export type { Messages };
