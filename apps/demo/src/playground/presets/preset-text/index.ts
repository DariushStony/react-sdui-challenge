import type { Preset } from '../preset';

const presetText = (preset: Preset): string => JSON.stringify(preset.payload, null, 2);

export { presetText };
