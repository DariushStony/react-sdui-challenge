import type { ReactNode, Ref } from 'react';
import styles from './Alert.module.css';
import { cx } from './cx';

export type AlertProps = {
  tone: 'error' | 'success' | 'info';
  title?: string | undefined;
  /** For example a Retry button. */
  action?: ReactNode;
  /** Lets code move focus here, for example to announce a success (ADR-0010). */
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
};

/**
 * A message block. An error is announced at once (`role="alert"`); a success or an informational
 * message is announced politely (`role="status"`). It can take focus from code but is not in the
 * tab order.
 */
export function Alert({ tone, title, action, ref, children }: AlertProps) {
  return (
    <div
      ref={ref}
      role={tone === 'error' ? 'alert' : 'status'}
      tabIndex={-1}
      className={cx(styles['alert'], styles[tone])}
    >
      {title ? <p className={styles['title']}>{title}</p> : null}
      <div className={styles['body']}>{children}</div>
      {action ? <div className={styles['action']}>{action}</div> : null}
    </div>
  );
}
