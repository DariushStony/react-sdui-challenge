import { type ControlSize } from '../../../ui-kit/props/control-size';

/** What every control needs from the frame: ids, ARIA state and the field's own flags. */
type ControlProps = {
  id: string;
  'aria-describedby': string | undefined;
  'aria-required': true | undefined;
  invalid: boolean;
  disabled?: true;
  readOnly?: true;
  size?: ControlSize;
};

export type { ControlProps };
