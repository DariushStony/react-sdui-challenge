# ADR-0020: A coloured JSON box: a small tokenizer drawn behind a real text area

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | FR-35, FR-36, FR-40, NFR-01, NFR-09; ADR-0013 |

## Context and problem statement

The Playground's box for the form's JSON was plain text. A person who edits a payload by hand has no help seeing a missing quote or the difference between a key and a value. Syntax colouring helps, but the box is also an accessible form control and the project has a size budget.

## Decision drivers

- The text area must stay the real control (label, keyboard, selection, undo, screen reader).
- Colours must meet WCAG AA contrast, and survive forced-colour modes.
- Little code and no large dependency (NFR-09: 150 kB of application JavaScript).
- It must never break on text that is not valid JSON; the box is where it gets fixed.

## Considered options

1. A code-editor library (CodeMirror 6, Monaco): complete, but 100 kB or more and its own accessibility model.
2. A highlighter library (Prism, highlight.js, Shiki): it makes coloured HTML, not an editor, so an overlay is needed anyway, and the grammar is far more than JSON needs.
3. A small tokenizer for JSON (about 40 lines), and the coloured text drawn behind a text area whose own text is transparent.

## Decision outcome

**Option 3.** `tokenizeJson` is a lexer, not a parser: a single pass, one alternative per kind (space, string, number, literal, punctuation), and anything else is `invalid`. It never fails and never drops a character, so the pieces joined give the text back exactly. A string followed by a colon is a key. `JsonEditor` draws the pieces as `<span data-token="...">` in an `aria-hidden` `<pre>` under the text area, which keeps its real text transparent but its caret and selection. The two share font, size, padding and `white-space: pre` (no wrapping), the copy follows the scroll, and the copy ends with an extra line break so it has the room of the box's last line. In forced-colour modes the copy is hidden and the real text shows. A text longer than 100,000 characters is not coloured, so typing never lags.

Colours (contrast on the white surface): keys 8.7, strings 6.3, numbers 7.3, literals 7.0, punctuation 6.5, invalid text in the danger colour with a wavy underline (colour is not the only cue).

### Consequences

- Good: about 0.6 kB of JavaScript, the text area keeps all its native behaviour, no new dependency, and a typo is marked before the diagnostics say so.
- Bad: no line numbers, folding or bracket matching, and no wrapping of long lines (they scroll sideways). A different technique would be needed for a full editor.

### Confirmation

TC-U33 (the tokenizer: every kind, key against string, escapes, Persian text, unterminated strings, invalid text, and that every character of every preset survives), TC-C17 (the editor is one labelled text area, the copy is hidden from assistive technology, colours follow typing, the copy follows the scroll, long texts are not coloured), and TC-M05: the copy and the text area have the same size and font in Chrome, Firefox and WebKit, and axe reports no violations on the Playground at desktop and phone width.
