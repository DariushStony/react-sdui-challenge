import { render, screen } from '@testing-library/react';
import { axe } from 'vi-axe';
import type { Issue, RejectionReason } from '@dynamic-form/renderer';
import { t } from '../../test/t';
import { RejectionAlert } from './rejection-alert';
import { TechnicalDetails } from './technical-details';
import { WarningsAlert } from './warnings-alert';

// What the person sees when a payload cannot be shown or was shown with caveats. The form page and
// the Playground both use these, so the wording lives in one place.
const issue = (path: string, message: string, field?: string): Issue => ({
  path,
  code: 'x',
  message,
  ...(field === undefined ? {} : { field }),
});

describe('RejectionAlert', () => {
  it.each<[RejectionReason, string]>([
    ['invalid', t('rejected_invalid')],
    ['outdated', t('rejected_outdated')],
    ['unknown-required-kind', t('rejected_unknown_required_kind', { field: 'score' })],
    ['duplicate-name', t('rejected_duplicate_name', { field: 'score' })],
  ])('explains "%s" in Persian and names the field', (reason, message) => {
    render(<RejectionAlert reason={reason} issues={[issue('fields[2]', 'why', 'score')]} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(t('rejected_title'));
    expect(alert).toHaveTextContent(message);
  });

  it('lists each issue as a technical detail, left to right', () => {
    render(
      <RejectionAlert
        reason="invalid"
        issues={[issue('fields', 'must be a list'), issue('title', 'must be text')]}
      />,
    );
    expect(screen.getByText('fields: must be a list').closest('ul')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('title: must be text')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RejectionAlert reason="outdated" issues={[issue('a', 'b')]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('TechnicalDetails', () => {
  it('shows nothing when there is nothing to say', () => {
    const { container } = render(<TechnicalDetails lines={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('WarningsAlert', () => {
  it('shows nothing without warnings', () => {
    const { container } = render(<WarningsAlert warnings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('counts the warnings and lists them as technical details', () => {
    render(
      <WarningsAlert warnings={[issue('fields[5]', 'Skipped field "score"'), issue('x', 'y')]} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(t('warnings_title', { count: 2 }));
    expect(screen.getByText('fields[5]: Skipped field "score"')).toBeInTheDocument();
  });
});
