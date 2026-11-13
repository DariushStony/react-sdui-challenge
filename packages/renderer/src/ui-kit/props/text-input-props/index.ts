import type { ComponentPropsWithRef } from 'react';
import type { ControlSize } from '../control-size';

type TextInputProps = Omit<ComponentPropsWithRef<'input'>, 'size'> & {
  invalid?: boolean | undefined;
  size?: ControlSize | undefined;
};

export type { TextInputProps };
