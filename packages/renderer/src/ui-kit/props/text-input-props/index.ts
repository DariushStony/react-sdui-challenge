import type { ComponentPropsWithRef } from 'react';
import type { ControlSize } from '../control-size';

type TextInputProps = Omit<ComponentPropsWithRef<'input'>, 'size'> & {
  /** The value failed a check: render `aria-invalid` (and the error look) for it. */
  invalid?: boolean | undefined;
  /** A design-token name for the size; map it onto the kit's own sizes. */
  size?: ControlSize | undefined;
};

export type { TextInputProps };
