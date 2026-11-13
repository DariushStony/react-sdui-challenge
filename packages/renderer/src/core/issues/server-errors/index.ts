import type { FieldError } from '../field-error';

/** Errors reported by the server for one submission (PRD FR-33). */
type ServerErrors = {
  /** Keyed by field name; a name that is not a known field is moved to the form-level list. */
  readonly fields: Readonly<Record<string, readonly FieldError[]>>;
  readonly form: readonly FieldError[];
};

export type { ServerErrors };
