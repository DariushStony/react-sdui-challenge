import type { ReactNode, Ref } from 'react';

type AlertProps = {
  tone: 'error' | 'success' | 'info';
  title?: string | undefined;
  /** For example a Retry button. */
  action?: ReactNode;
  /**
   * The root element. The engine moves keyboard focus to it, to announce a success or an error and so
   * a person who just used a button that has gone starts from it (ADR-0010), so the root must be
   * focusable from code: give it `tabIndex={-1}`. An error should be announced at once
   * (`role="alert"`), the other tones politely (`role="status"`).
   */
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
};

export type { AlertProps };
