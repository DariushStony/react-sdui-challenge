import { useEffect, useRef, type ReactNode } from 'react';
import { useMessages } from '../../provider/use-messages';
import { useUiKit } from '../../provider/use-ui-kit';

type SuccessPanelProps = {
  summary?: ReactNode;
  onEdit: () => void;
  onNew: () => void;
};

/**
 * Shown instead of the form after a successful submit. It takes focus so the outcome is announced
 * and keyboard users start from it (ADR-0010). "Edit and resubmit" keeps everything that was
 * entered; "New form" starts again.
 */
function SuccessPanel({ summary, onEdit, onNew }: SuccessPanelProps) {
  const { Alert, Button } = useUiKit();
  const { t } = useMessages();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <Alert
      ref={ref}
      tone="success"
      title={t('submit_success_title')}
      action={
        <>
          <Button variant="secondary" onClick={onEdit}>
            {t('edit_again')}
          </Button>
          <Button onClick={onNew}>{t('new_form')}</Button>
        </>
      }
    >
      {summary ?? t('submit_success')}
    </Alert>
  );
}

export { SuccessPanel };
