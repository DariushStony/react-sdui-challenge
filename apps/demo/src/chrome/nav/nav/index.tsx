import styles from './styles.module.css';
import type { NavItem } from '../nav-item';

/** Links between the views of the app. The current one is marked for assistive technology. */
function Nav({ label, items }: { label: string; items: readonly NavItem[] }) {
  return (
    <nav aria-label={label} className={styles['nav']}>
      <ul className={styles['list']}>
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={item.current ? `${styles['link']} ${styles['current']}` : styles['link']}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { Nav };
