import type { FieldSize } from '../field-size';

type FieldBase = {
  /** Unique within a form; also the name of the submitted part. */
  readonly name: string;
  /** Display text with any trailing colon already removed. */
  readonly label: string;
  readonly description?: string;
  readonly placeholder?: string;
  /** False for legacy payloads unless they say otherwise; the legacy shape cannot express it. */
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  /** A design-token name, never CSS (FR-14). */
  readonly size?: FieldSize;
};

export type { FieldBase };
