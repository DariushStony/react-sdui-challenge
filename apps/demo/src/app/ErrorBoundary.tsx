import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Button } from '@dynamic-form/renderer';
import { Page } from '../chrome/Page';
import { t } from '../messages/t';

type Props = {
  children: ReactNode;
  /** What "Reload" does; the page reloads by default. Tests pass their own. */
  onReload?: () => void;
};

/**
 * The last line of defence (NFR-07): a bug while rendering shows a message and a way out instead of
 * a blank page. A class, because React offers no hook for catching render errors.
 */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[app] render failed', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    const reload = this.props.onReload ?? (() => location.reload());
    return (
      <Page title={t('error_boundary_title')}>
        <Alert
          tone="error"
          title={t('error_boundary_title')}
          action={<Button onClick={reload}>{t('reload')}</Button>}
        >
          {t('error_boundary')}
        </Alert>
      </Page>
    );
  }
}
