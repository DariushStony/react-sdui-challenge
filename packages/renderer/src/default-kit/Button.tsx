import styles from './Button.module.css';
import type { ButtonProps } from '../ui-kit';
import { cx } from './cx';

export function Button({
  type = 'button',
  variant = 'primary',
  busy,
  className,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx(styles['button'], styles[variant], className)}
      aria-disabled={busy ? true : undefined}
      aria-busy={busy ? true : undefined}
      onClick={(event) => {
        // Not `disabled`: a disabled button drops out of the tab order and loses keyboard focus.
        // preventDefault also stops a submit button from submitting its form.
        if (busy) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );
}
