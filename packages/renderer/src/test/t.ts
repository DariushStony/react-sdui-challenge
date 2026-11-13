import { createTranslator } from '../i18n/create-translator';
import { faMessages } from '../i18n/fa-messages';

// The Persian text, for tests that assert what a person would read.
const { t } = createTranslator(faMessages);

export { t };
