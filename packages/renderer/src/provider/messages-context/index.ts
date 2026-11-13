import { createContext } from 'react';
import { createTranslator } from '../../i18n/create-translator';
import { faMessages } from '../../i18n/fa-messages';
import type { Translator } from '../../i18n/translator';

const MessagesContext = createContext<Translator>(createTranslator(faMessages));

export { MessagesContext };
