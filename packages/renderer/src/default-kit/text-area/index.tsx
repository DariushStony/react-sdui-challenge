import { controlStyles as styles } from '../control-styles';
import { cx } from '../cx';
import type { TextAreaProps } from '../../ui-kit/props/text-area-props';

/** A multi-line text control, with the same props as TextInput. */
function TextArea({ invalid, size, className, ...rest }: TextAreaProps) {
  return (
    <textarea
      {...rest}
      className={cx(styles['control'], className)}
      data-size={size}
      aria-invalid={invalid ? true : undefined}
    />
  );
}

export { TextArea };
