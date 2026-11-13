export type Direction = 'rtl' | 'ltr';

/** Sets the page direction (and optionally the language). Used by tests and the playground. */
export function setDocumentDirection(direction: Direction, lang?: string): void {
  document.documentElement.dir = direction;
  if (lang !== undefined) document.documentElement.lang = lang;
}

/** The page is right-to-left unless it was explicitly switched (index.html sets rtl). */
export function getDirection(): Direction {
  return document.documentElement.dir === 'ltr' ? 'ltr' : 'rtl';
}
