import { render, screen } from '@testing-library/react';
import { axe } from 'vi-axe';
import { Form, FormActions } from './Form';
import { VisuallyHidden } from './VisuallyHidden';

// TC-C11 for the two small layout primitives. Neither has behaviour of its own; they exist so the
// form engine never needs a stylesheet.
describe('Form', () => {
  it('is a form element that leaves validation to the app, and passes its props on', () => {
    render(
      <Form aria-label="فرم" onSubmit={(event) => event.preventDefault()}>
        <button type="submit">ارسال</button>
      </Form>,
    );
    const form = screen.getByRole('form', { name: 'فرم' });
    expect(form).toHaveAttribute('novalidate');
  });

  it('groups actions in a row', () => {
    render(
      <FormActions>
        <button type="button">الف</button>
        <button type="button">ب</button>
      </FormActions>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Form aria-label="فرم">
        <FormActions>
          <button type="submit">ارسال</button>
        </FormActions>
      </Form>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('VisuallyHidden', () => {
  it('keeps its text available to screen readers', () => {
    render(<VisuallyHidden>در حال ارسال</VisuallyHidden>);
    expect(screen.getByText('در حال ارسال')).toBeInTheDocument();
  });

  it('can be a polite live region, for status messages that change', () => {
    render(<VisuallyHidden live>پیام</VisuallyHidden>);
    expect(screen.getByText('پیام')).toHaveAttribute('aria-live', 'polite');
  });

  it('is not a live region unless asked', () => {
    render(<VisuallyHidden>پیام</VisuallyHidden>);
    expect(screen.getByText('پیام')).not.toHaveAttribute('aria-live');
  });
});
