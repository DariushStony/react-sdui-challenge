import type { ReactNode } from 'react';

type FieldProps = {
  /** The id of the control inside; the label and the ids of the hint and the error derive from it. */
  id: string;
  label: string;
  required?: boolean | undefined;
  description?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
};

export type { FieldProps };
