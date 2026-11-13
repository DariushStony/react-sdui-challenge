import styles from './Control.module.css';
import { cx } from './cx';
import type { TextAreaProps } from '../ui-kit';

/** A multi-line text control, with the same props as TextInput. */
export function TextArea({ invalid, size, className, ...rest }: TextAreaProps) {
  return (
    <textarea
      {...rest}
      className={cx(styles['control'], className)}
      data-size={size}
      aria-invalid={invalid ? true : undefined}
    />
  );
}
