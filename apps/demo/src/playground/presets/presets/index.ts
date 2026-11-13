import { legacyCarPayload } from '../../../mocks/fixtures/legacy-car';
import { serverErrorPayload } from '../../../mocks/fixtures/scenarios/server-error-payload';
import { unknownOptionalPayload } from '../../../mocks/fixtures/scenarios/unknown-optional-payload';
import { unknownRequiredPayload } from '../../../mocks/fixtures/scenarios/unknown-required-payload';
import { v2CarPayload } from '../../../mocks/fixtures/v2-car';
import type { Preset } from '../preset';

// The payloads are the mock's fixtures, so the Playground and the mock cannot drift apart. The
// "server error" preset is the v2 form again; what differs is how its dry-run submit answers.
const PRESETS: readonly Preset[] = [
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

export { PRESETS };
