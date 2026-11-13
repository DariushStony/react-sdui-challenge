import { getDirection } from './get-direction';
import { setDocumentDirection } from './set-document-direction';

// The page is right-to-left Persian by default (index.html); tests and the playground can flip it
// to check nothing is tied to one direction (PRD FR-38, FR-39).
afterEach(() => {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'fa';
});

describe('document direction', () => {
  it('sets the direction and the language on the root element', () => {
    setDocumentDirection('ltr', 'en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });

  it('keeps the language when only the direction is given', () => {
    document.documentElement.lang = 'fa';
    setDocumentDirection('ltr');
    expect(document.documentElement.lang).toBe('fa');
  });

  it('reads the current direction, defaulting to rtl', () => {
    document.documentElement.dir = '';
    expect(getDirection()).toBe('rtl');
    setDocumentDirection('ltr');
    expect(getDirection()).toBe('ltr');
  });
});
