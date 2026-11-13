import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { axe } from 'vi-axe';
import { Alert } from '.';
import { Button } from '../button';

// TC-C11. An error interrupts and must be announced at once (role alert); a success or an
// informational message is announced politely (role status) (ADR-0010).
describe('Alert', () => {
  it('announces an error as an alert', () => {
    render(<Alert tone="error">خطا رخ داد</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('خطا رخ داد');
  });

  it.each(['success', 'info'] as const)('announces %s politely, as a status', (tone) => {
    render(<Alert tone={tone}>انجام شد</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('انجام شد');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('can carry a title and an action', () => {
    render(
      <Alert tone="error" title="ارسال نشد" action={<Button>تلاش مجدد</Button>}>
        اتصال قطع است
      </Alert>,
    );
    expect(screen.getByText('ارسال نشد')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'تلاش مجدد' })).toBeInTheDocument();
  });

  it('can receive focus from code, so the form can move it here after a success', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Alert tone="success" ref={ref}>
        ثبت شد
      </Alert>,
    );
    ref.current?.focus();
    expect(screen.getByRole('status')).toHaveFocus();
  });

  it('has no accessibility violations in any tone', async () => {
    const { container } = render(
      <>
        <Alert tone="error" title="الف">
          متن
        </Alert>
        <Alert tone="success">متن</Alert>
        <Alert tone="info">متن</Alert>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
