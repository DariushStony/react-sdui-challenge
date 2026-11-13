import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { axe } from 'vi-axe';
import { FilePicker } from './FilePicker';

// TC-C08, TC-C11. The control a person uses is a real button; the native file input behind it is
// hidden. The button's name is the field label plus its own text, so what is on screen is part of
// what a screen reader says.
const png = (name: string) => new File(['x'], name, { type: 'image/png' });

function renderPicker(props: Partial<React.ComponentProps<typeof FilePicker>> = {}) {
  const onFiles = vi.fn();
  const result = render(
    <>
      <span id="car-label">تصاویر ماشین</span>
      <FilePicker
        id="car"
        labelledBy="car-label"
        buttonLabel="انتخاب فایل‌ها"
        status="فایلی انتخاب نشده است."
        onFiles={onFiles}
        {...props}
      />
    </>,
  );
  const input = result.container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('the hidden file input is missing');
  return { ...result, onFiles, input };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FilePicker', () => {
  it('is one button whose name is the field label followed by its own text', () => {
    renderPicker();
    expect(screen.getByRole('button')).toHaveAccessibleName('تصاویر ماشین انتخاب فایل‌ها');
  });

  it('shows a status line next to the button, announced politely when it changes', () => {
    renderPicker();
    expect(screen.getByText('فایلی انتخاب نشده است.')).toHaveAttribute('aria-live', 'polite');
  });

  it('keeps the native input hidden, out of the tab order and out of the accessibility tree', () => {
    const { input } = renderPicker();
    expect(input).toHaveAttribute('hidden');
    expect(input).toHaveAttribute('tabindex', '-1');
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(document.querySelectorAll('input:not([hidden])')).toHaveLength(0);
  });

  it('opens the file dialog when the button is pressed with a pointer or the keyboard', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    renderPicker();
    await userEvent.click(screen.getByRole('button'));
    expect(click).toHaveBeenCalledTimes(1);

    await userEvent.tab();
    screen.getByRole('button').focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(click).toHaveBeenCalledTimes(3);
  });

  it('passes accept and multiple to the native input', () => {
    const { input } = renderPicker({ accept: 'image/*,.pdf', multiple: true });
    expect(input).toHaveAttribute('accept', 'image/*,.pdf');
    expect(input).toHaveAttribute('multiple');
  });

  it('is single-file unless told otherwise', () => {
    const { input } = renderPicker();
    expect(input).not.toHaveAttribute('multiple');
  });

  it('reports the chosen files and then clears the input, so the same file can be chosen again', async () => {
    const { onFiles, input } = renderPicker({ multiple: true });
    await userEvent.upload(input, [png('a.png'), png('b.png')]);
    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(onFiles.mock.calls[0]?.[0].map((f: File) => f.name)).toEqual(['a.png', 'b.png']);
    expect(input.value).toBe('');
  });

  it('points at the hint and the error with aria-describedby', () => {
    renderPicker({ describedBy: 'car-description car-error' });
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-describedby',
      'car-description car-error',
    );
  });

  it('can be disabled', () => {
    renderPicker({ disabled: true });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('hands the button to a ref, so a form can focus it', () => {
    const ref = createRef<HTMLButtonElement>();
    renderPicker({ buttonRef: ref });
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('reports when the button loses focus', async () => {
    const onBlur = vi.fn();
    renderPicker({ onBlur });
    screen.getByRole('button').focus();
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderPicker({ describedBy: 'x' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
