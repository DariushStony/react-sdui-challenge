import type { ComponentPropsWithRef } from 'react';

/** The form container. Validation is the app's job, so a kit should switch the browser's own bubbles off. */
type FormProps = ComponentPropsWithRef<'form'>;

export type { FormProps };
