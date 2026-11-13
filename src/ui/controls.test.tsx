import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { axe } from 'vi-axe';
import { Select } from './Select';
import { TextArea } from './TextArea';
import { TextInput } from './TextInput';

// TC-C11 for the three form controls. They are thin: a native element with the design's styling,
// `aria-invalid` from one `invalid` flag, a size token, and a ref the form can focus.
describe.each([
  ['TextInput', (props: object) => <TextInput aria-label="control" {...props} />],
  ['TextArea', (props: object) => <TextArea aria-label="control" {...props} />],
  [
    'Select',
    (props: object) => (
      <Select aria-label="control" {...props}>
        <option value="">—</option>
        <option value="gas">گاز</option>
      </Select>
    ),
  ],
])('%s', (_name, renderControl) => {
  it('is marked invalid only when told so', () => {
    const { rerender } = render(renderControl({}));
    expect(screen.getByLabelText('control')).not.toHaveAttribute('aria-invalid');
    rerender(renderControl({ invalid: true }));
    expect(screen.getByLabelText('control')).toHaveAttribute('aria-invalid', 'true');
  });

  it('carries the size token for the stylesheet', () => {
    render(renderControl({ size: 'large' }));
    expect(screen.getByLabelText('control')).toHaveAttribute('data-size', 'large');
  });

  it('passes through the attributes a form needs', () => {
    render(renderControl({ id: 'x', name: 'brand', disabled: true, 'aria-describedby': 'hint' }));
    const control = screen.getByLabelText('control');
    expect(control).toHaveAttribute('id', 'x');
    expect(control).toHaveAttribute('name', 'brand');
    expect(control).toBeDisabled();
    expect(control).toHaveAttribute('aria-describedby', 'hint');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(renderControl({}));
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('TextInput', () => {
  it('hands its element to a ref, so the form can focus it', () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextInput aria-label="control" ref={ref} />);
    expect(ref.current).toBe(screen.getByLabelText('control'));
  });

  it('accepts typing, an input mode and a placeholder', async () => {
    render(<TextInput aria-label="control" inputMode="numeric" placeholder="سال" />);
    const input = screen.getByLabelText('control');
    await userEvent.type(input, '۱۳۹۸');
    expect(input).toHaveValue('۱۳۹۸');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('placeholder', 'سال');
  });

  it('can be read-only', () => {
    render(<TextInput aria-label="control" readOnly />);
    expect(screen.getByLabelText('control')).toHaveAttribute('readonly');
  });
});

describe('TextArea', () => {
  it('hands its element to a ref and keeps line breaks', async () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextArea aria-label="control" ref={ref} />);
    await userEvent.type(screen.getByLabelText('control'), 'الف{Enter}ب');
    expect(ref.current?.value).toBe('الف\nب');
  });
});

describe('Select', () => {
  it('lets the person choose an option and reports the value', async () => {
    render(
      <Select aria-label="control">
        <option value="">—</option>
        <option value="gas">گاز</option>
      </Select>,
    );
    await userEvent.selectOptions(screen.getByLabelText('control'), 'gas');
    expect(screen.getByLabelText('control')).toHaveValue('gas');
  });

  it('hands its element to a ref', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select aria-label="control" ref={ref}>
        <option value="a">a</option>
      </Select>,
    );
    expect(ref.current).toBe(screen.getByLabelText('control'));
  });
});
