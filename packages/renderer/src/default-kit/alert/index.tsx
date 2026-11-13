import styles from './styles.module.css';
import type { AlertProps } from '../../ui-kit/props/alert-props';
import { cx } from '../cx';

/**
 * A message block. An error is announced at once (`role="alert"`); a success or an informational
 * message is announced politely (`role="status"`). It can take focus from code but is not in the
 * tab order.
 */
function Alert({ tone, title, action, ref, children }: AlertProps) {
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

export { Alert };
