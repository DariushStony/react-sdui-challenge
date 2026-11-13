import { render, screen } from '@testing-library/react';
import { axe } from 'vi-axe';
import { Page } from '.';
import { Spinner } from '../spinner';

describe('Page', () => {
  it('is the main landmark of the document, named by one top-level heading', () => {
    render(<Page title="ثبت آگهی">محتوا</Page>);
    const main = screen.getByRole('main');
    expect(main).toHaveAccessibleName('ثبت آگهی');
    expect(screen.getByRole('heading', { level: 1, name: 'ثبت آگهی' })).toBeInTheDocument();
    expect(main).toHaveTextContent('محتوا');
  });

  // WCAG 2.4.2: the tab and the screen reader's page announcement say which page this is.
  it('names the document after the page, and follows the title when it changes', () => {
    const { rerender } = render(<Page title="ثبت آگهی">محتوا</Page>);
    expect(document.title).toBe('ثبت آگهی');

    rerender(<Page title="آزمایشگاه">محتوا</Page>);
    expect(document.title).toBe('آزمایشگاه');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Page title="ثبت آگهی">محتوا</Page>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Spinner', () => {
  it('announces its label politely, so loading is not silent for screen readers', () => {
    render(<Spinner label="در حال بارگذاری" />);
    expect(screen.getByRole('status')).toHaveTextContent('در حال بارگذاری');
  });

  it('hides the moving graphic from assistive technology', () => {
    const { container } = render(<Spinner label="در حال بارگذاری" />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Spinner label="در حال بارگذاری" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
