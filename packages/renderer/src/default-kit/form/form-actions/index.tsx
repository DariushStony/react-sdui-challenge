import styles from './styles.module.css';
import type { FormActionsProps } from '../../../ui-kit/props/form-actions-props';

/** A row for the form's buttons. */
function FormActions({ children }: FormActionsProps) {
  return <div className={styles['actions']}>{children}</div>;
}

export { FormActions };
