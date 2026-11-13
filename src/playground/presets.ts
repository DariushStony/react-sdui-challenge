import { legacyCarPayload } from '../mocks/fixtures/legacy-car';
import {
  serverErrorPayload,
  unknownOptionalPayload,
  unknownRequiredPayload,
} from '../mocks/fixtures/scenarios';
import { v2CarPayload } from '../mocks/fixtures/v2-car';

/** What the Playground's pretend server answers when the preview is submitted. */
export type DryRunResult = 'success' | 'validation' | 'network';

export type Preset = {
  readonly id: string;
  /** Catalog key of the name shown in the list. */
  readonly labelKey: string;
  readonly payload: unknown;
  readonly result: DryRunResult;
};

// The payloads are the mock's fixtures, so the Playground and the mock cannot drift apart. The
// "server error" preset is the v2 form again; what differs is how its dry-run submit answers.
export const PRESETS: readonly Preset[] = [
  { id: 'legacy', labelKey: 'preset_legacy', payload: legacyCarPayload, result: 'success' },
  { id: 'v2', labelKey: 'preset_v2', payload: v2CarPayload, result: 'success' },
  {
    id: 'unknown-optional',
    labelKey: 'preset_unknown_optional',
    payload: unknownOptionalPayload,
    result: 'success',
  },
  {
    id: 'unknown-required',
    labelKey: 'preset_unknown_required',
    payload: unknownRequiredPayload,
    result: 'success',
  },
  {
    id: 'server-error',
    labelKey: 'preset_server_error',
    payload: serverErrorPayload,
    result: 'validation',
  },
];

export const presetText = (preset: Preset): string => JSON.stringify(preset.payload, null, 2);
