import { render, screen } from '@testing-library/react';
import { axe } from 'vi-axe';
import { Field, describedBy, fieldIds } from './Field';
import { TextInput } from './TextInput';

// TC-C01 (the part that belongs to the primitive), TC-C10, TC-C11. A field is a visible label, the
// control, an optional hint, and an error area that always exists so assistive technology can
// announce a message that appears later (ADR-0010).
describe('fieldIds and describedBy', () => {
  it('derives stable ids from the control id', () => {
    expect(fieldIds('brand')).toEqual({
      label: 'brand-label',
      description: 'brand-description',
      error: 'brand-error',
    });
  });

  it.each([
    [{ description: false, error: false }, undefined],
    [{ description: true, error: false }, 'brand-description'],
    [{ description: false, error: true }, 'brand-error'],
    [{ description: true, error: true }, 'brand-description brand-error'],
  ])('points %j at %j', (parts, expected) => {
    expect(describedBy('brand', parts)).toBe(expected);
  });
});

describe('Field', () => {
  it('connects the visible label to the control', () => {
    render(
      <Field id="brand" label="برند">
        <TextInput id="brand" />
      </Field>,
    );
    expect(screen.getByLabelText('برند')).toBe(screen.getByRole('textbox'));
  });

  it('gives the label an id, so a control that is not a native input can be named by it', () => {
    render(
      <Field id="brand" label="برند">
        <TextInput id="brand" />
      </Field>,
    );
    expect(screen.getByText('برند')).toHaveAttribute('id', 'brand-label');
  });

  it('marks a required field with a symbol that is hidden from screen readers', () => {
    render(
      <Field id="brand" label="برند" required>
        <TextInput id="brand" aria-required="true" />
      </Field>,
    );
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows the hint with the id the control can point at', () => {
    render(
      <Field id="brand" label="برند" description="نام سازنده خودرو">
        <TextInput
          id="brand"
          aria-describedby={describedBy('brand', { description: true, error: false })}
        />
      </Field>,
    );
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('نام سازنده خودرو');
  });

  it('always has an empty polite live region for errors, so a later message is announced', () => {
    render(
      <Field id="brand" label="برند">
        <TextInput id="brand" />
      </Field>,
    );
    const region = document.getElementById('brand-error');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toBeEmptyDOMElement();
  });

  it('shows an error in that region, and the control is described by it', () => {
    render(
      <Field id="brand" label="برند" error="این فیلد الزامی است.">
        <TextInput
          id="brand"
          invalid
          aria-describedby={describedBy('brand', { description: false, error: true })}
        />
      </Field>,
    );
    expect(document.getElementById('brand-error')).toHaveTextContent('این فیلد الزامی است.');
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('این فیلد الزامی است.');
  });

  it('has no accessibility violations, with a hint and an error', async () => {
    const { container } = render(
      <Field id="brand" label="برند" required description="نام سازنده" error="الزامی است">
        <TextInput
          id="brand"
          invalid
          aria-required="true"
          aria-describedby={describedBy('brand', { description: true, error: true })}
        />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
