import type { ComponentPropsWithRef, ReactNode } from 'react';
import styles from './Form.module.css';
import { cx } from './cx';

/** The form container. Validation is the app's job, so the browser's own bubbles are switched off. */
export function Form({ className, ...rest }: ComponentPropsWithRef<'form'>) {
  return <form {...rest} noValidate className={cx(styles['form'], className)} />;
}

/** A row for the form's buttons. */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className={styles['actions']}>{children}</div>;
}
