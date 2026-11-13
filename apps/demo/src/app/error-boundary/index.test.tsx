import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { t } from '../../test/t';
import { ErrorBoundary } from '.';

// TC-P05: a bug in rendering must not leave a blank page (NFR-07).
function Boom(): never {
  throw new Error('render failed');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React and the boundary both log the error on purpose; keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('shows what was rendered when nothing goes wrong', () => {
    render(
      <ErrorBoundary onReload={() => undefined}>
        <p>محتوا</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('محتوا')).toBeInTheDocument();
  });

  it('replaces a crashed subtree with a message and a Reload action', async () => {
    const onReload = vi.fn();
    render(
      <ErrorBoundary onReload={onReload}>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(t('error_boundary_title'));
    await userEvent.click(screen.getByRole('button', { name: t('reload') }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('logs the error so it can be found', () => {
    render(
      <ErrorBoundary onReload={() => undefined}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(console.error).toHaveBeenCalledWith(
      '[app] render failed',
      expect.objectContaining({ message: 'render failed' }),
      expect.any(String),
    );
  });
});
