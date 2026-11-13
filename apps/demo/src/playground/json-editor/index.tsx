import { useMemo, useRef, type UIEvent } from 'react';
import { defaultUiKit } from '@dynamic-form/renderer';
import { MAX_HIGHLIGHTED_LENGTH } from '../max-highlighted-length';
import { tokenizeJson } from '../tokenize-json';
import styles from './styles.module.css';

const { TextArea } = defaultUiKit;

type JsonEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  describedBy?: string | undefined;
  rows?: number;
};

/**
 * A text area with coloured JSON (ADR-0020). The coloured text is a copy drawn behind the real
 * control, which has transparent text and keeps everything a text area gives: label, keyboard,
 * selection, caret, undo, spell check off. A person who uses a screen reader meets one text box, since
 * the copy is `aria-hidden`. The two must line up exactly, so they share font, size, padding and
 * `white-space: pre` (no wrapping), and the copy follows the scroll of the box.
 */
function JsonEditor({ id, value, onChange, describedBy, rows = 16 }: JsonEditorProps) {
  const copy = useRef<HTMLPreElement>(null);
  const tokens = useMemo(
    () => (value.length > MAX_HIGHLIGHTED_LENGTH ? null : tokenizeJson(value)),
    [value],
  );

  const follow = (event: UIEvent<HTMLTextAreaElement>) => {
    if (copy.current === null) return;
    copy.current.scrollTop = event.currentTarget.scrollTop;
    copy.current.scrollLeft = event.currentTarget.scrollLeft;
  };

  return (
    <div className={styles.editor}>
      {/* The extra line break gives the copy the room the last line of the box has: without it the
          copy would end earlier than the box when scrolled to the bottom. */}
      <pre ref={copy} className={styles.copy} aria-hidden="true">
        <code>
          {tokens === null
            ? value
            : tokens.map((token, index) =>
                token.type === 'space' ? (
                  token.text
                ) : (
                  <span key={index} data-token={token.type}>
                    {token.text}
                  </span>
                ),
              )}
          {'\n'}
        </code>
      </pre>
      <TextArea
        id={id}
        className={styles.input}
        dir="ltr"
        rows={rows}
        spellCheck={false}
        wrap="off"
        value={value}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        onScroll={follow}
      />
    </div>
  );
}

export { JsonEditor };
