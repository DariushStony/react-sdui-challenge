import type { ReactNode } from 'react';
import styles from './VisuallyHidden.module.css';

/**
 * Text that is not drawn but is read by screen readers. With `live` it is a polite live region, for
 * a status that changes (for example "sending") that a sighted person sees in another way.
 */
export function VisuallyHidden({ children, live }: { children: ReactNode; live?: boolean }) {
  return (
    <span className={styles['hidden']} aria-live={live ? 'polite' : undefined}>
      {children}
    </span>
  );
}
