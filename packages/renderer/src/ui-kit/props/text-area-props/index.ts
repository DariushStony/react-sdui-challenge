import type { ComponentPropsWithRef } from 'react';
import type { ControlSize } from '../control-size';

type TextAreaProps = ComponentPropsWithRef<'textarea'> & {
  invalid?: boolean | undefined;
  size?: ControlSize | undefined;
};

export type { TextAreaProps };
