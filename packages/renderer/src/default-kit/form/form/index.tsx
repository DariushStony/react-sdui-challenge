import styles from './styles.module.css';
import type { FormProps } from '../../../ui-kit/props/form-props';
import { cx } from '../../cx';

/** The form container. Validation is the app's job, so the browser's own bubbles are switched off. */
function Form({ className, ...rest }: FormProps) {
  return <form {...rest} noValidate className={cx(styles['form'], className)} />;
}

export { Form };
