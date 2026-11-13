import styles from './Nav.module.css';
import { cx } from './cx';

export type NavItem = { href: string; text: string; current: boolean };

/** Links between the views of the app. The current one is marked for assistive technology. */
export function Nav({ label, items }: { label: string; items: readonly NavItem[] }) {
  return (
    <nav aria-label={label} className={styles['nav']}>
      <ul className={styles['list']}>
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={cx(styles['link'], item.current && styles['current'])}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
