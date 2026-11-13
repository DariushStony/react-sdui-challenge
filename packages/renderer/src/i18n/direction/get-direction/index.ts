import type { Direction } from '../direction';

/** The page is right-to-left unless it was explicitly switched (index.html sets rtl). */
function getDirection(): Direction {
  return document.documentElement.dir === 'ltr' ? 'ltr' : 'rtl';
}

export { getDirection };
