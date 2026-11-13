import { getDirection } from './get-direction';
import { setDocumentDirection } from './set-document-direction';

// The page is right-to-left Persian by default (index.html); tests and the playground can flip it
// to check nothing is tied to one direction (PRD FR-38, FR-39).
afterEach(() => {
  document.documentElement.dir = 'rtl';
});

describe('document direction', () => {
  it('sets the direction on the root element', () => {
    setDocumentDirection('ltr');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('reads the current direction, defaulting to rtl', () => {
    document.documentElement.dir = '';
    expect(getDirection()).toBe('rtl');
    setDocumentDirection('ltr');
    expect(getDirection()).toBe('ltr');
  });
});
