import type { Issue } from '../../../core/issues/issue';
import { type V2Base } from '../../../core/v2/v2-base';
import type { StringField } from '../string-field';

type StringV2 =
  | {
      readonly ok: true;
      readonly base: V2Base;
      readonly rules: StringField['rules'];
      readonly warnings: readonly Issue[];
    }
  | { readonly ok: false; readonly issues: readonly Issue[] };

export type { StringV2 };
