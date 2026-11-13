import { useId, type ReactNode } from 'react';
import styles from './Page.module.css';

/** The page frame: the one `main` landmark, named by the page's single top-level heading. */
export function Page({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <main aria-labelledby={headingId} className={styles['page']}>
      <h1 id={headingId} className={styles['title']}>
        {title}
      </h1>
      {children}
    </main>
  );
}
