import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MAX_HIGHLIGHTED_LENGTH } from '../max-highlighted-length';
import { JsonEditor } from '.';

function Harness({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  return (
    <>
      <label htmlFor="json">JSON</label>
      <JsonEditor id="json" value={text} onChange={setText} describedBy="hint" />
      <p id="hint">hint</p>
    </>
  );
}

const overlay = (container: HTMLElement) => container.querySelector('pre')!;
const spans = (container: HTMLElement, type: string) =>
  [...container.querySelectorAll(`[data-token="${type}"]`)].map((node) => node.textContent);

// TC-C17: ADR-0020. The text area stays the real control (label, keyboard, selection, spell
// check off); the coloured copy behind it is decoration, so a screen reader never meets it twice.
describe('JsonEditor', () => {
  it('is a labelled text area holding the text, with the hint attached', () => {
    render(<Harness initial='{"a": 1}' />);
    const box = screen.getByLabelText('JSON');
    expect(box.tagName).toBe('TEXTAREA');
    expect(box).toHaveValue('{"a": 1}');
    expect(box).toHaveAttribute('aria-describedby', 'hint');
    expect(box).toHaveAttribute('dir', 'ltr');
    expect(box).toHaveAttribute('spellcheck', 'false');
  });

  it('colours keys, strings, numbers and literals in a copy behind the text area', () => {
    const { container } = render(
      <Harness initial='{"name": "پژو", "year": 2019, "new": true, "x": null}' />,
    );
    expect(spans(container, 'key')).toEqual(['"name"', '"year"', '"new"', '"x"']);
    expect(spans(container, 'string')).toEqual(['"پژو"']);
    expect(spans(container, 'number')).toEqual(['2019']);
    expect(spans(container, 'literal')).toEqual(['true', 'null']);
  });

  it('keeps the coloured copy out of the accessibility tree and the tab order', () => {
    const { container } = render(<Harness initial='{"a": 1}' />);
    const copy = overlay(container);
    expect(copy).toHaveAttribute('aria-hidden', 'true');
    expect(copy.querySelectorAll('[tabindex], a, button, input')).toHaveLength(0);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('shows what is typed in both, as it is typed', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness initial="" />);
    await user.type(screen.getByLabelText('JSON'), '{{"k": 7}');
    expect(screen.getByLabelText('JSON')).toHaveValue('{"k": 7}');
    expect(spans(container, 'key')).toEqual(['"k"']);
    expect(spans(container, 'number')).toEqual(['7']);
  });

  it('marks what is not JSON, so a typo is visible before the diagnostics say so', () => {
    const { container } = render(<Harness initial="{'a': 1}" />);
    expect(spans(container, 'invalid')).toEqual(["'a'"]);
  });

  it('ends the copy with a line break so the last line of the text area has a line to match', () => {
    const { container } = render(<Harness initial={'{\n}\n'} />);
    expect(overlay(container).textContent).toBe('{\n}\n\n');
  });

  it('follows the text area when it scrolls', () => {
    const { container } = render(<Harness initial={'{}\n'.repeat(60)} />);
    const box = screen.getByLabelText('JSON');
    Object.assign(box, { scrollTop: 120, scrollLeft: 30 });
    fireEvent.scroll(box);
    expect(overlay(container).scrollTop).toBe(120);
    expect(overlay(container).scrollLeft).toBe(30);
  });

  it('stops colouring a very long text instead of slowing every keystroke', () => {
    const long = `"${'a'.repeat(MAX_HIGHLIGHTED_LENGTH)}"`;
    const { container } = render(<Harness initial={long} />);
    expect(container.querySelectorAll('[data-token]')).toHaveLength(0);
    expect(screen.getByLabelText('JSON')).toHaveValue(long);
  });
});
