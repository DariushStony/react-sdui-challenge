import styles from './Form.module.css';
import type { FormActionsProps, FormProps } from '../ui-kit';
import { cx } from './cx';

/** The form container. Validation is the app's job, so the browser's own bubbles are switched off. */
export function Form({ className, ...rest }: FormProps) {
  return <form {...rest} noValidate className={cx(styles['form'], className)} />;
}

/** A row for the form's buttons. */
export function FormActions({ children }: FormActionsProps) {
  return <div className={styles['actions']}>{children}</div>;
}
