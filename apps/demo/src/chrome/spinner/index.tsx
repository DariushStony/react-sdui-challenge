import styles from './styles.module.css';

/** A loading indicator. The text is what assistive technology announces; the ring is decoration. */
function Spinner({ label }: { label: string }) {
  return (
    <output className={styles['spinner']}>
      <span aria-hidden="true" className={styles['ring']} />
      <span>{label}</span>
    </output>
  );
}

export { Spinner };
