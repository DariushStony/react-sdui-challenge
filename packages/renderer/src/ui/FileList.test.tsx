import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vi-axe';
import { FileList, type FileListItem } from './FileList';

// TC-C05, TC-C06, TC-C11 (the list primitive). It only shows what it is given: the app decides the
// texts, the thumbnails and what removing means.
const items: FileListItem[] = [
  { key: 'a', name: 'front.png', sizeLabel: '۱٫۵ مگابایت', previewUrl: 'blob:front' },
  { key: 'b', name: 'manual.pdf', sizeLabel: '۲۰۰ کیلوبایت' },
];

const removeLabel = (name: string) => `حذف فایل «${name}»`;
const removeText = 'حذف';

describe('FileList', () => {
  it('lists every file in order with its name and size', () => {
    render(
      <FileList
        items={items}
        removeLabel={removeLabel}
        removeText={removeText}
        onRemove={() => undefined}
      />,
    );
    const rows = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('front.png');
    expect(rows[0]).toHaveTextContent('۱٫۵ مگابایت');
    expect(rows[1]).toHaveTextContent('manual.pdf');
  });

  it('shows a thumbnail only for an item that has a preview, and hides it from screen readers', () => {
    const { container } = render(
      <FileList
        items={items}
        removeLabel={removeLabel}
        removeText={removeText}
        onRemove={() => undefined}
      />,
    );
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute('src', 'blob:front');
    expect(images[0]).toHaveAttribute('alt', '');
  });

  it('gives each remove button a name that says which file it removes', () => {
    render(
      <FileList
        items={items}
        removeLabel={removeLabel}
        removeText={removeText}
        onRemove={() => undefined}
      />,
    );
    expect(screen.getByRole('button', { name: 'حذف فایل «front.png»' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'حذف فایل «manual.pdf»' })).toBeInTheDocument();
  });

  it('shows a visible word on the remove button that is part of its accessible name', () => {
    render(
      <FileList
        items={items}
        removeLabel={removeLabel}
        removeText={removeText}
        onRemove={() => undefined}
      />,
    );
    const [button] = screen.getAllByRole('button');
    expect(button).toHaveTextContent('حذف');
    expect(button?.getAttribute('aria-label')).toContain('حذف');
  });

  it('reports the key of the file whose remove button was pressed', async () => {
    const onRemove = vi.fn();
    render(
      <FileList
        items={items}
        removeLabel={removeLabel}
        removeText={removeText}
        onRemove={onRemove}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'حذف فایل «manual.pdf»' }));
    expect(onRemove).toHaveBeenCalledWith('b');
  });

  it('can disable every remove button, for a field that is disabled or read-only', () => {
    render(
      <FileList
        items={items}
        removeLabel={removeLabel}
        removeText={removeText}
        disabled
        onRemove={() => undefined}
      />,
    );
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  });

  it('marks an item that has a problem', () => {
    render(
      <FileList
        items={[{ ...items[1]!, invalid: true }]}
        removeLabel={removeLabel}
        removeText={removeText}
        onRemove={() => undefined}
      />,
    );
    expect(screen.getByRole('listitem')).toHaveAttribute('data-invalid', 'true');
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(
      <FileList
        items={[]}
        removeLabel={removeLabel}
        removeText={removeText}
        onRemove={() => undefined}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FileList
        items={items}
        removeLabel={removeLabel}
        removeText={removeText}
        onRemove={() => undefined}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
