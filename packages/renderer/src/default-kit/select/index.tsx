import { controlStyles as styles } from '../control-styles';
import { cx } from '../cx';
import type { SelectProps } from '../../ui-kit/props/select-props';

/** A single-choice control; its options are passed as children. */
function Select({ invalid, size, className, children, ...rest }: SelectProps) {
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

export { Select };
