import type { Direction } from '../direction';

/** Sets the direction of the whole page, as the Playground's left-to-right preview does. */
function setDocumentDirection(direction: Direction): void {
  document.documentElement.dir = direction;
}

export { setDocumentDirection };
