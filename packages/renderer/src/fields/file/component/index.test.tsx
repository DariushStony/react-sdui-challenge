import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vi-axe';
import type { FileField } from '../../../core/model/file-field';
import { createTranslator } from '../../../i18n/create-translator';
import { faMessages } from '../../../i18n/fa-messages';
import { t } from '../../../test/t';
import { renderField } from '../../../test/render-field';
import { FileComponent } from '.';

const { formatBytes } = createTranslator(faMessages);

// TC-C05, TC-C06, TC-C07, TC-C08. The riskiest component: the native input is hidden behind a real
// button, files are listed with thumbnails whose object URLs must be released, and everything has to
// work from the keyboard.
const field = (overrides: Partial<FileField> = {}): FileField => ({
  kind: 'file',
  name: 'car_images',
  label: 'تصاویر ماشین',
  required: false,
  multiple: true,
  rules: {},
  ...overrides,
});

const file = (name: string, content = 'x', type = 'image/png', lastModified = 1) =>
  new File([content], name, { type, lastModified });

const hiddenInput = (container: HTMLElement) => {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('the hidden file input is missing');
  return input;
};

const lastFiles = (onChange: ReturnType<typeof renderField>['onChange']): string[] => {
  const value = onChange.mock.lastCall?.[0];
  return Array.isArray(value) ? value.map((f) => f.name) : [];
};

let createObjectURL: ReturnType<typeof vi.spyOn>;
let revokeObjectURL: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  createObjectURL = vi
    .spyOn(URL, 'createObjectURL')
    .mockImplementation((blob) => `blob:${blob instanceof File ? blob.name : 'unknown'}`);
  revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FileComponent: choosing', () => {
  it('shows the label, a choose button, and says that nothing is chosen yet', () => {
    renderField(FileComponent, { field: field(), value: [] });
    expect(screen.getByRole('button')).toHaveAccessibleName(`تصاویر ماشین ${t('choose_files')}`);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByText(t('files_none'))).toBeInTheDocument();
  });

  it('uses the singular button text for a single-file field', () => {
    renderField(FileComponent, { field: field({ multiple: false }), value: [] });
    expect(screen.getByRole('button')).toHaveTextContent(t('choose_file'));
  });

  it('lists the chosen files with their sizes, and a thumbnail for images only', async () => {
    const { container } = renderField(FileComponent, { field: field(), value: [] });
    await userEvent.upload(hiddenInput(container), [
      file('front.png', 'aaa'),
      file('manual.pdf', 'bbbbb', 'application/pdf'),
    ]);

    const rows = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('front.png');
    expect(rows[0]).toHaveTextContent(formatBytes(3));
    expect(rows[1]).toHaveTextContent('manual.pdf');
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute('src', 'blob:front.png');
  });

  it('reports the chosen files, adding to the ones already chosen', async () => {
    const { container, onChange } = renderField(FileComponent, { field: field(), value: [] });
    await userEvent.upload(hiddenInput(container), [file('a.png')]);
    await userEvent.upload(hiddenInput(container), [file('b.png', 'yy')]);
    expect(lastFiles(onChange)).toEqual(['a.png', 'b.png']);
  });

  it('replaces the file in a single-file field', async () => {
    const { container, onChange } = renderField(FileComponent, {
      field: field({ multiple: false }),
      value: [],
    });
    await userEvent.upload(hiddenInput(container), [file('a.png')]);
    await userEvent.upload(hiddenInput(container), [file('b.png', 'yy')]);
    expect(lastFiles(onChange)).toEqual(['b.png']);
    expect(hiddenInput(container)).not.toHaveAttribute('multiple');
  });

  it('passes the accepted types and the multiple flag to the native input', () => {
    const { container } = renderField(FileComponent, {
      field: field({ rules: { accept: ['image/*', '.pdf'] } }),
      value: [],
    });
    expect(hiddenInput(container)).toHaveAttribute('accept', 'image/*,.pdf');
    expect(hiddenInput(container)).toHaveAttribute('multiple');
  });

  it('states what is allowed, in words, as part of the control description', () => {
    renderField(FileComponent, {
      field: field({
        description: 'تصویر واضح بگیرید.',
        rules: { accept: ['image/*'], maxBytes: 5 * 1024 * 1024, maxFiles: 5 },
      }),
      value: [],
    });
    const description = screen.getByRole('button').getAttribute('aria-describedby');
    expect(description).toBeTruthy();
    expect(screen.getByRole('button')).toHaveAccessibleDescription(
      expect.stringContaining('تصویر واضح بگیرید.'),
    );
    expect(screen.getByRole('button')).toHaveAccessibleDescription(
      expect.stringContaining('image/*'),
    );
    expect(screen.getByRole('button')).toHaveAccessibleDescription(
      expect.stringContaining('۵ مگابایت'),
    );
    expect(screen.getByRole('button')).toHaveAccessibleDescription(expect.stringContaining('۵'));
  });

  it('announces how many files are chosen, politely', async () => {
    const { container } = renderField(FileComponent, { field: field(), value: [] });
    await userEvent.upload(hiddenInput(container), [file('a.png'), file('b.png', 'yy')]);
    const status = screen.getByText(t('files_count', { count: 2 }));
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('reports a blur after a choice, so the form checks the files at once', async () => {
    const { container, onBlur } = renderField(FileComponent, { field: field(), value: [] });
    await userEvent.upload(hiddenInput(container), [file('a.png')]);
    expect(onBlur).toHaveBeenCalled();
  });

  it('hands the picker button to inputRef, so the engine can focus it', () => {
    const { inputRef } = renderField(FileComponent, { field: field(), value: [] });
    expect(inputRef).toHaveBeenCalledWith(screen.getByRole('button'));
  });
});

describe('FileComponent: removing', () => {
  const twoFiles = [file('a.png'), file('b.png', 'yy')];

  it('removes only the chosen file, and releases only its thumbnail address', async () => {
    const { onChange } = renderField(FileComponent, { field: field(), value: twoFiles });
    await userEvent.click(screen.getByRole('button', { name: 'حذف فایل «a.png»' }));
    expect(lastFiles(onChange)).toEqual(['b.png']);
    expect(screen.queryByText('a.png')).not.toBeInTheDocument();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:a.png');
    expect(revokeObjectURL).not.toHaveBeenCalledWith('blob:b.png');
  });

  it('releases every remaining thumbnail address when the field goes away', () => {
    const { unmount } = renderField(FileComponent, { field: field(), value: twoFiles });
    expect(createObjectURL).toHaveBeenCalledTimes(2);
    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:a.png');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:b.png');
  });

  it('gives each remove button a name that says which file it removes', () => {
    renderField(FileComponent, { field: field(), value: twoFiles });
    expect(screen.getByRole('button', { name: 'حذف فایل «a.png»' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'حذف فایل «b.png»' })).toBeInTheDocument();
  });

  it('moves focus back to the choose button after a removal, so focus is not lost', async () => {
    renderField(FileComponent, { field: field(), value: twoFiles });
    await userEvent.click(screen.getByRole('button', { name: 'حذف فایل «a.png»' }));
    expect(screen.getByRole('button', { name: new RegExp(t('choose_files')) })).toHaveFocus();
  });

  it('reports a blur after a removal, so the form checks the files at once', async () => {
    const { onBlur } = renderField(FileComponent, { field: field(), value: twoFiles });
    await userEvent.click(screen.getByRole('button', { name: 'حذف فایل «a.png»' }));
    expect(onBlur).toHaveBeenCalled();
  });
});

describe('FileComponent: the same file twice', () => {
  it('does not list a file that is already chosen', async () => {
    const { container, onChange } = renderField(FileComponent, { field: field(), value: [] });
    await userEvent.upload(hiddenInput(container), [file('a.png')]);
    await userEvent.upload(hiddenInput(container), [file('a.png')]);
    expect(lastFiles(onChange)).toEqual(['a.png']);
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(1);
  });

  it('keeps a file with the same name but a different size', async () => {
    const { container, onChange } = renderField(FileComponent, { field: field(), value: [] });
    await userEvent.upload(hiddenInput(container), [file('a.png', 'x')]);
    await userEvent.upload(hiddenInput(container), [file('a.png', 'xx')]);
    expect(lastFiles(onChange)).toEqual(['a.png', 'a.png']);
  });

  it('accepts the same file again after it was removed', async () => {
    const { container, onChange } = renderField(FileComponent, { field: field(), value: [] });
    await userEvent.upload(hiddenInput(container), [file('a.png')]);
    await userEvent.click(screen.getByRole('button', { name: 'حذف فایل «a.png»' }));
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    await userEvent.upload(hiddenInput(container), [file('a.png')]);
    expect(lastFiles(onChange)).toEqual(['a.png']);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});

describe('FileComponent: keyboard and assistive technology', () => {
  it('opens the file dialog from the keyboard', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    renderField(FileComponent, { field: field(), value: [] });
    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('reaches every remove button with Tab, in list order, and presses it with the keyboard', async () => {
    const { onChange } = renderField(FileComponent, {
      field: field(),
      value: [file('a.png'), file('b.png', 'yy')],
    });
    await userEvent.tab();
    expect(screen.getByRole('button', { name: new RegExp(t('choose_files')) })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'حذف فایل «a.png»' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'حذف فایل «b.png»' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(lastFiles(onChange)).toEqual(['a.png']);
  });

  it('says it is required in its description, because a button cannot carry aria-required', () => {
    renderField(FileComponent, { field: field({ required: true }), value: [] });
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-required');
    expect(screen.getByRole('button')).toHaveAccessibleDescription(
      expect.stringContaining(t('required_hint')),
    );
  });

  it('describes the control by the error, and shows every error with its file name', () => {
    renderField(FileComponent, {
      field: field(),
      value: [file('big.png', 'xxxxxxx')],
      errors: [
        { code: 'file_too_large', params: { file: 'big.png', maxBytes: 5 } },
        { code: 'file_type', params: { file: 'big.png', accept: 'image/*' } },
      ],
    });
    const picker = screen.getByRole('button', { name: new RegExp(t('choose_files')) });
    expect(picker).toHaveAccessibleDescription(
      expect.stringContaining(t('file_too_large', { file: 'big.png', maxBytes: 5 })),
    );
    expect(picker).toHaveAccessibleDescription(
      expect.stringContaining(t('file_type', { file: 'big.png', accept: 'image/*' })),
    );
  });

  it('marks the file that has a problem in the list', () => {
    renderField(FileComponent, {
      field: field(),
      value: [file('ok.png'), file('big.png', 'xxxxxxx')],
      errors: [{ code: 'file_too_large', params: { file: 'big.png', maxBytes: 5 } }],
    });
    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).not.toHaveAttribute('data-invalid');
    expect(rows[1]).toHaveAttribute('data-invalid', 'true');
  });

  it('is disabled, and cannot be changed, when the field is disabled or read-only', () => {
    const { unmount } = renderField(FileComponent, {
      field: field({ disabled: true }),
      value: [file('a.png')],
    });
    expect(screen.getByRole('button', { name: new RegExp(t('choose_files')) })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'حذف فایل «a.png»' })).toBeDisabled();
    unmount();

    renderField(FileComponent, { field: field({ readOnly: true }), value: [file('a.png')] });
    expect(screen.getByRole('button', { name: new RegExp(t('choose_files')) })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'حذف فایل «a.png»' })).toBeDisabled();
  });

  it('has no accessibility violations, empty, with files, and with errors', async () => {
    const empty = renderField(FileComponent, { field: field({ required: true }), value: [] });
    expect(await axe(empty.container)).toHaveNoViolations();
    empty.unmount();

    const full = renderField(FileComponent, {
      field: field({ description: 'هینت', rules: { accept: ['image/*'], maxBytes: 5 } }),
      value: [file('a.png'), file('b.pdf', 'xxxxxxx', 'application/pdf')],
      errors: [{ code: 'file_type', params: { file: 'b.pdf', accept: 'image/*' } }],
    });
    expect(await axe(full.container)).toHaveNoViolations();
  });
});

// A field that is disabled or read-only must not change, whatever reaches it: the label points at
// the native input, and a change event can be fired on it directly.
describe('FileComponent: locked fields', () => {
  it.each([
    ['disabled', { disabled: true }],
    ['read-only', { readOnly: true }],
  ] as const)('ignores files for a %s field', (_name, flags) => {
    const { container, onChange } = renderField(FileComponent, {
      field: field(flags),
      value: [],
    });
    const input = hiddenInput(container);

    expect(input).toBeDisabled();
    fireEvent.change(input, { target: { files: [file('sneaky.png')] } });
    expect(onChange).not.toHaveBeenCalled();
  });
});
