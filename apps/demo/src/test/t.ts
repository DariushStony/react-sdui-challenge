import { createTranslator, faMessages } from '@dynamic-form/renderer';
import { appMessages } from '../messages/app-messages';

// For tests that read the whole page: the form's own text (from the renderer) and the demo's.
const { t } = createTranslator({
  locale: 'fa-IR',
  catalog: { ...faMessages.catalog, ...appMessages.catalog },
});

export { t };
