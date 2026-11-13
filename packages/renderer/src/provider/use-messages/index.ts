import { useContext } from 'react';
import type { Translator } from '../../i18n/translator';
import { MessagesContext } from '../messages-context';

/** The translator to speak with: the host's language, or Persian. */
function useMessages(): Translator {
  return useContext(MessagesContext);
}

export { useMessages };
