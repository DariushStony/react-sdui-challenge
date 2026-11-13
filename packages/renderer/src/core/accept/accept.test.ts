// @vitest-environment node
import { acceptMatches } from './accept-matches';

// TC-U03. `accept` tokens are a MIME type, a `type/*` wildcard, or an extension; the browser's own
// filtering is only a hint, so the same check runs on every selected file (FR-26).
const png = { name: 'photo.png', type: 'image/png' };
const pdf = { name: 'doc.pdf', type: 'application/pdf' };

describe('acceptMatches with a catch-all', () => {
  it.each(['*/*', '*'])('%s accepts any file, even one with no MIME type', (token) => {
    expect(acceptMatches(png, [token])).toBe(true);
    expect(acceptMatches(pdf, [token])).toBe(true);
    expect(acceptMatches({ name: 'README', type: '' }, [token])).toBe(true);
  });
});

describe('acceptMatches', () => {
  it.each([
    ['wildcard matches any subtype', png, ['image/*'], true],
    ['wildcard rejects another type', pdf, ['image/*'], false],
    ['exact MIME matches', pdf, ['application/pdf'], true],
    [
      'exact MIME is case-insensitive',
      { name: 'a.pdf', type: 'Application/PDF' },
      ['application/pdf'],
      true,
    ],
    ['extension matches', pdf, ['.pdf'], true],
    [
      'extension is case-insensitive in both places',
      { name: 'SCAN.PDF', type: '' },
      ['.pdf'],
      true,
    ],
    ['extension rejects another extension', png, ['.pdf'], false],
    ['any one token is enough', png, ['.pdf', 'image/*'], true],
    ['tokens are trimmed', png, [' image/* '], true],
    ['empty type falls back to the extension', { name: 'a.png', type: '' }, ['.png'], true],
    ['empty type cannot match a MIME token', { name: 'a.png', type: '' }, ['image/*'], false],
    [
      'no type and no extension matches nothing',
      { name: 'README', type: '' },
      ['image/*', '.pdf'],
      false,
    ],
    ['an empty list means no restriction', { name: 'README', type: '' }, [], true],
    [
      'a dot inside the name is not an extension match for another suffix',
      { name: 'a.pdf.exe', type: '' },
      ['.pdf'],
      false,
    ],
  ])('%s', (_name, file, accept, expected) => {
    expect(acceptMatches(file, accept)).toBe(expected);
  });
});
