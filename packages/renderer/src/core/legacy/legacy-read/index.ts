import type { Issue } from '../../issues/issue';
import { type Raw } from '../../wire/raw';
import type { LegacyBase } from '../legacy-base';

type LegacyRead =
  | { readonly ok: true; readonly props: Raw; readonly base: LegacyBase }
  | { readonly ok: false; readonly issues: readonly Issue[] };

export type { LegacyRead };
