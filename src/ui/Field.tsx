import type { ReactNode } from 'react';
import styles from './Field.module.css';

/** The ids a field gives its hint and its error area, derived from the control's id. */
export function fieldIds(id: string): { description: string; error: string } {
  return { description: `${id}-description`, error: `${id}-error` };
}

/** The `aria-describedby` value for a control: only the parts that are on screen. */
export function describedBy(
  id: string,
  parts: { readonly description: boolean; readonly error: boolean },
): string | undefined {
  const ids = fieldIds(id);
  const listed: string[] = [];
  if (parts.description) listed.push(ids.description);
  if (parts.error) listed.push(ids.error);
  return listed.length > 0 ? listed.join(' ') : undefined;
}

export type FieldProps = {
  /** The id of the control inside; the label and the ids of the hint and the error derive from it. */
  id: string;
  label: string;
  required?: boolean | undefined;
  description?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
};

/**
 * A visible label, the control, an optional hint and an error area. The error area always exists
 * (empty when there is no error) as a polite live region, so a message that appears later is
 * announced (ADR-0010). The control gets `aria-describedby` from `describedBy`.
 */
export function Field({ id, label, required, description, error, children }: FieldProps) {
  const ids = fieldIds(id);
  return (
    <div className={styles['field']}>
      <label htmlFor={id} className={styles['label']}>
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
