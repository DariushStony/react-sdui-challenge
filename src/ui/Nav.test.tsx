import { render, screen } from '@testing-library/react';
import { axe } from 'vi-axe';
import { Nav } from './Nav';
import { Section } from './Section';

const items = [
  { href: '#/forms/car', text: 'فرم', current: true },
  { href: '#/playground', text: 'آزمایشگاه', current: false },
];

describe('Nav', () => {
  it('is a named navigation landmark with one link per item', () => {
    render(<Nav label="بخش‌ها" items={items} />);
    const nav = screen.getByRole('navigation', { name: 'بخش‌ها' });
    expect(nav).toBeVisible();
    expect(screen.getByRole('link', { name: 'فرم' })).toHaveAttribute('href', '#/forms/car');
    expect(screen.getByRole('link', { name: 'آزمایشگاه' })).toHaveAttribute('href', '#/playground');
  });

  it('marks the current page, and only that one', () => {
    render(<Nav label="بخش‌ها" items={items} />);
    expect(screen.getByRole('link', { name: 'فرم' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'آزمایشگاه' })).not.toHaveAttribute('aria-current');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Nav label="بخش‌ها" items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Section', () => {
  it('is a region named by its heading', () => {
    render(<Section title="پیش‌نمایش">محتوا</Section>);
    const region = screen.getByRole('region', { name: 'پیش‌نمایش' });
    expect(region).toHaveTextContent('محتوا');
    expect(screen.getByRole('heading', { level: 2, name: 'پیش‌نمایش' })).toBeVisible();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Section title="پیش‌نمایش">محتوا</Section>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
