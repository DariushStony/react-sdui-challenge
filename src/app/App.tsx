import { useSyncExternalStore } from 'react';
import { t } from '../i18n/t';
import { Alert } from '../ui';
import { ErrorBoundary } from './ErrorBoundary';
import { FormPage } from './FormPage';
import { Providers } from './providers';
import { formIdFromHash } from './route';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

const currentFormId = () => formIdFromHash(window.location.hash);

/**
 * The composition root: error boundary, services, and the page for the form named in the address.
 * `mockFailure` is the reason the mock worker could not start, shown above the form so a missing
 * mock is explained rather than discovered as odd network errors (EC-17).
 */
export function App({ mockFailure }: { mockFailure?: string }) {
  const formId = useSyncExternalStore(subscribe, currentFormId);
  const notice =
    mockFailure === undefined ? null : (
      <Alert tone="error" title={t('mock_failed_title')}>
        {t('mock_failed')} <bdi dir="ltr">{mockFailure}</bdi>
      </Alert>
    );

  return (
    <ErrorBoundary>
      <Providers>
        <FormPage formId={formId} notice={notice} />
      </Providers>
    </ErrorBoundary>
  );
}
