import type { ComponentPropsWithRef } from 'react';
import styles from './Control.module.css';
import { cx } from './cx';
import type { ControlSize } from './types';

export type TextAreaProps = ComponentPropsWithRef<'textarea'> & {
  invalid?: boolean | undefined;
  size?: ControlSize | undefined;
};

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
