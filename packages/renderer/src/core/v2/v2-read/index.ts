import type { Issue } from '../../issues/issue';
import type { V2Base } from '../v2-base';

type V2Read<Rules> =
  | {
      readonly ok: true;
      readonly base: V2Base;
      readonly rules: Rules;
      readonly warnings: readonly Issue[];
    }
  | { readonly ok: false; readonly issues: readonly Issue[] };

export type { V2Read };
