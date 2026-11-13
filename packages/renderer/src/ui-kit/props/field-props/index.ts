import type { ReactNode } from 'react';

type FieldProps = {
  /** The id of the control inside; the label and the ids of the hint and the error derive from it. */
  id: string;
  label: string;
  required?: boolean | undefined;
  description?: string | undefined;
  /**
   * The error text, or nothing. It may hold several messages, one per line (separated by `\n`), so the
   * element that shows it must keep line breaks (the default kit uses `white-space: pre-line`). Keep
   * the element in the page even when there is no error, as a polite live region, so a message that
   * appears later is announced (ADR-0010).
   */
  error?: string | undefined;
  children: ReactNode;
};

export type { FieldProps };
