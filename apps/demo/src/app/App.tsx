import { useSyncExternalStore } from 'react';
import { Alert } from '@dynamic-form/renderer';
import { Nav } from '../chrome/Nav';
import { t } from '../messages/t';
import { PlaygroundView } from '../playground/PlaygroundView';
import { ErrorBoundary } from './ErrorBoundary';
import { FormPage } from './FormPage';
import { Providers } from './providers';
import { DEFAULT_FORM_ID, routeFromHash } from './route';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

const currentHash = () => window.location.hash;

/**
 * The composition root: error boundary, services, and the view named in the address.
 * `mockFailure` is the reason the mock worker could not start, shown above the form so a missing
 * mock is explained rather than discovered as odd network errors (EC-17).
 */
export function App({ mockFailure }: { mockFailure?: string }) {
  const route = routeFromHash(useSyncExternalStore(subscribe, currentHash));
  const notice =
    mockFailure === undefined ? null : (
      <Alert tone="error" title={t('mock_failed_title')}>
        {t('mock_failed')} <bdi dir="ltr">{mockFailure}</bdi>
      </Alert>
    );

  return (
    <ErrorBoundary>
      <Providers>
        <Nav
          label={t('nav_label')}
          items={[
            {
              href: `#/forms/${DEFAULT_FORM_ID}`,
              text: t('nav_form'),
              current: route.view === 'form',
            },
            {
              href: '#/playground',
              text: t('nav_playground'),
              current: route.view === 'playground',
            },
          ]}
        />
        {route.view === 'playground' ? (
          <PlaygroundView />
        ) : (
          <FormPage formId={route.formId} notice={notice} />
        )}
      </Providers>
    </ErrorBoundary>
  );
}
