import type { DryRunResult } from '../dry-run-result';

type Preset = {
  readonly id: string;
  /** Catalog key of the name shown in the list. */
  readonly labelKey: string;
  readonly payload: unknown;
  readonly result: DryRunResult;
};

export type { Preset };
