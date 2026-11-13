import { useSyncExternalStore } from 'react';
import { defaultUiKit } from '@dynamic-form/renderer';
import { Nav } from '../../chrome/nav/nav';
import { t } from '../../messages/t';
import { PlaygroundView } from '../../playground/playground-view';
import { ErrorBoundary } from '../error-boundary';
import { FormPage } from '../form-page';
import { Providers } from '../providers';
import { DEFAULT_FORM_ID } from '../route/default-form-id';
import { routeFromHash } from '../route/route-from-hash';

const { Alert } = defaultUiKit;

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
function App({ mockFailure }: { mockFailure?: string }) {
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

export { App };
