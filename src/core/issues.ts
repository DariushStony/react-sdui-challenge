import type { FormModel } from './model';

/** A developer-facing finding about a payload (English; never shown to the form filler). */
export type Issue = {
  /** Where in the payload, for example `fields[2].props.min`. */
  readonly path: string;
  readonly code: string;
  readonly message: string;
};

/** Why a payload was refused. Each reason has its own message in the UI (ADR-0011). */
export type RejectionReason = 'invalid' | 'outdated' | 'unknown-required-kind' | 'duplicate-name';

export type ParseResult =
  | { readonly ok: true; readonly model: FormModel; readonly warnings: readonly Issue[] }
  | { readonly ok: false; readonly reason: RejectionReason; readonly issues: readonly Issue[] };

/** A stable message code plus the values its text needs; Persian text is built at display time. */
export type FieldError = {
  readonly code: string;
  readonly params?: Readonly<Record<string, string | number>>;
};

/** Errors reported by the server for one submission (PRD FR-33). */
export type ServerErrors = {
  /** Keyed by field name; a name that is not a known field is moved to the form-level list. */
  readonly fields: Readonly<Record<string, readonly FieldError[]>>;
  readonly form: readonly FieldError[];
};
