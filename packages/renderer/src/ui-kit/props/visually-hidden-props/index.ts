import type { ReactNode } from 'react';

/**
 * Text that is not drawn but is read by screen readers. With `live` it is a polite live region, for
 * a status that changes (for example "sending") that a sighted person sees in another way.
 */
type VisuallyHiddenProps = { children: ReactNode; live?: boolean };

export type { VisuallyHiddenProps };
