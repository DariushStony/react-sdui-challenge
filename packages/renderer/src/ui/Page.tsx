import { useEffect, useId, type ReactNode } from 'react';
import styles from './Page.module.css';

/**
 * The page frame: the one `main` landmark, named by the page's single top-level heading. It also
 * names the document, so the tab and a screen reader's page announcement say which page this is
 * (WCAG 2.4.2).
 */
export function Page({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  useEffect(() => {
    document.title = title;
  }, [title]);
  return (
    <main aria-labelledby={headingId} className={styles['page']}>
      <h1 id={headingId} className={styles['title']}>
        {title}
      </h1>
      {children}
    </main>
  );
}
