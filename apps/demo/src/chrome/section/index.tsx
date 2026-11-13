import { useId, type ReactNode } from 'react';
import styles from './styles.module.css';

/** A titled block of a page: a region named by its own second-level heading. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={styles['section']}>
      <h2 id={headingId} className={styles['title']}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export { Section };
