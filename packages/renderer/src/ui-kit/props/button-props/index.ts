import type { ComponentPropsWithRef } from 'react';

type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'type'> & {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  /** While busy the button ignores clicks and submits, but stays focusable (PRD FR-31). */
  busy?: boolean | undefined;
};

export type { ButtonProps };
