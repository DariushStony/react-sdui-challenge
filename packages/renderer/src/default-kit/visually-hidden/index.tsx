import type { VisuallyHiddenProps } from '../../ui-kit/props/visually-hidden-props';
import styles from './styles.module.css';

/**
 * Text that is not drawn but is read by screen readers. With `live` it is a polite live region, for
 * a status that changes (for example "sending") that a sighted person sees in another way.
 */
function VisuallyHidden({ children, live }: VisuallyHiddenProps) {
  return (
    <span className={styles['hidden']} aria-live={live ? 'polite' : undefined}>
      {children}
    </span>
  );
}

export { VisuallyHidden };
