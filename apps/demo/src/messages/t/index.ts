import { createTranslator } from '@dynamic-form/renderer';
import { appMessages } from '../app-messages';

// The demo's translator: pass a key from the demo's catalog.
const { t } = createTranslator(appMessages);

export { t };
