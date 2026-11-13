import type { ComponentPropsWithRef } from 'react';
import styles from './Control.module.css';
import { cx } from './cx';
import type { ControlSize } from './types';

export type TextInputProps = Omit<ComponentPropsWithRef<'input'>, 'size'> & {
  invalid?: boolean | undefined;
  size?: ControlSize | undefined;
};

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
