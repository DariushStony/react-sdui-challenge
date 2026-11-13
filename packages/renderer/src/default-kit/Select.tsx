import styles from './Control.module.css';
import { cx } from './cx';
import type { SelectProps } from '../ui-kit';

/** A single-choice control; its options are passed as children. */
export function Select({ invalid, size, className, children, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      className={cx(styles['control'], className)}
      data-size={size}
      aria-invalid={invalid ? true : undefined}
    >
      {children}
    </select>
  );
}
