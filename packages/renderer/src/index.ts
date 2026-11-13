// The public API of the renderer, client side: the form, and what a host gives it (a design system
// and a language). Everything is listed here because something outside the package needs it; the
// package's `exports` make nothing else reachable (ADR-0014, ADR-0017). It carries `"use client"`.

export { DynamicForm } from './engine/dynamic-form/dynamic-form';
export { DynamicFormProvider } from './provider/dynamic-form-provider';
export type { SubmitOutcome } from './engine/outcome';

// The design system the form renders with: the default kit, and what a kit author needs.
export { defaultUiKit } from './default-kit/default-ui-kit';
export { fieldIds } from './ui-kit/field-ids';
export type { UiKit } from './ui-kit/ui-kit';

// The language the form speaks: the two shipped catalogs, and how to build one's own.
export { createTranslator } from './i18n/create-translator';
export { enMessages } from './i18n/en-messages';
export { faMessages } from './i18n/fa-messages';
export type { Messages } from './i18n/messages';
