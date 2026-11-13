import type { ComponentPropsWithRef } from 'react';
import type { ControlSize } from '../control-size';

type SelectProps = Omit<ComponentPropsWithRef<'select'>, 'size'> & {
  invalid?: boolean | undefined;
  size?: ControlSize | undefined;
};

export type { SelectProps };
