import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vi-axe';
import { Button } from './Button';

// TC-C11, and the busy behaviour FR-31 relies on: while a submission is in flight the button must
// not start another one, yet stay focusable so keyboard users do not lose their place.
describe('Button', () => {
  it('is a plain button unless told it submits', () => {
    render(<Button>ارسال</Button>);
    expect(screen.getByRole('button', { name: 'ارسال' })).toHaveAttribute('type', 'button');
  });

  it('can be a submit button', () => {
    render(<Button type="submit">ارسال</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('calls its handler on click', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>ارسال</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks while busy, but stays focusable and says it is busy', async () => {
    const onClick = vi.fn();
    render(
      <Button busy onClick={onClick}>
        ارسال
      </Button>,
    );
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).not.toBeDisabled();
    button.focus();
    expect(button).toHaveFocus();
  });

  it('does not submit its form while busy', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" busy>
          ارسال
        </Button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits its form when not busy', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">ارسال</Button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('is really disabled when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        ارسال
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('has no accessibility violations in any variant', async () => {
    const { container } = render(
      <>
        <Button>الف</Button>
        <Button variant="secondary">ب</Button>
        <Button busy>ج</Button>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
