import styles from './Control.module.css';
import { cx } from './cx';
import type { TextInputProps } from '../ui-kit';

/** A single-line text control. `invalid` becomes `aria-invalid`; `size` is a design token name. */
export function TextInput({ invalid, size, className, ...rest }: TextInputProps) {
  return (
    <input
      {...rest}
      className={cx(styles['control'], className)}
      data-size={size}
      aria-invalid={invalid ? true : undefined}
    />
  );
}
