import type { Direction } from '../direction';

/** Sets the page direction (and optionally the language). Used by tests and the playground. */
function setDocumentDirection(direction: Direction, lang?: string): void {
  document.documentElement.dir = direction;
  if (lang !== undefined) document.documentElement.lang = lang;
}

export { setDocumentDirection };
