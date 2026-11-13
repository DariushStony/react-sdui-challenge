import type { ReactNode, Ref } from 'react';

type AlertProps = {
  tone: 'error' | 'success' | 'info';
  title?: string | undefined;
  /** For example a Retry button. */
  action?: ReactNode;
  /** Lets code move focus here, for example to announce a success (ADR-0010). */
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
};

export type { AlertProps };
