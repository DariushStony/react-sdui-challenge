import styles from './Spinner.module.css';

/** A loading indicator. The text is what assistive technology announces; the ring is decoration. */
export function Spinner({ label }: { label: string }) {
  return (
    <output className={styles['spinner']}>
      <span aria-hidden="true" className={styles['ring']} />
      <span>{label}</span>
    </output>
  );
}
