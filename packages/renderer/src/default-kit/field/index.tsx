import { fieldIds } from '../../ui-kit/field-ids';
import { type FieldProps } from '../../ui-kit/props/field-props';
import styles from './styles.module.css';

/**
 * A visible label, the control, an optional hint and an error area. The error area always exists
 * (empty when there is no error) as a polite live region, so a message that appears later is
 * announced (ADR-0010). The control gets `aria-describedby` from `describedBy`.
 */
function Field({ id, label, required, description, error, children }: FieldProps) {
  const ids = fieldIds(id);
  return (
    <div className={styles['field']}>
      <label id={ids.label} htmlFor={id} className={styles['label']}>
        {label}
        {required ? (
          <span aria-hidden="true" className={styles['marker']}>
            *
          </span>
        ) : null}
      </label>
      {description ? (
        <p id={ids.description} className={styles['description']}>
          {description}
        </p>
      ) : null}
      {children}
      <p id={ids.error} aria-live="polite" className={styles['error']}>
        {error}
      </p>
    </div>
  );
}

export { Field };
