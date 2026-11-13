import { normalize } from '../fields/definitions';
import { PRESETS, presetText } from './presets';

// FR-35: the five starting points, taken from the same fixtures as the mock.
describe('PRESETS', () => {
  it('offers the five presets of the PRD, each with a unique id', () => {
    expect(PRESETS.map((preset) => preset.id)).toEqual([
      'legacy',
      'v2',
      'unknown-optional',
      'unknown-required',
      'server-error',
    ]);
  });

  it.each([
    ['legacy', { ok: true }],
    ['v2', { ok: true }],
    ['unknown-optional', { ok: true }],
    ['unknown-required', { ok: false, reason: 'unknown-required-kind' }],
    ['server-error', { ok: true }],
  ])('"%s" goes through the normalizer as expected', (id, expected) => {
    const preset = PRESETS.find((candidate) => candidate.id === id)!;
    expect(normalize(JSON.parse(presetText(preset)), 'playground')).toMatchObject(expected);
  });

  it('skips the optional unknown kind with a warning', () => {
    const preset = PRESETS.find((candidate) => candidate.id === 'unknown-optional')!;
    const result = normalize(JSON.parse(presetText(preset)), 'playground');
    expect(result.ok && result.warnings.length).toBeGreaterThan(0);
  });

  it('answers the dry-run submit with a server error for the server-error preset, and success otherwise', () => {
    expect(PRESETS.map((preset) => preset.result)).toEqual([
      'success',
      'success',
      'success',
      'success',
      'validation',
    ]);
  });

  it('writes the payload as readable JSON that parses back to the same value', () => {
    const preset = PRESETS[1]!;
    expect(presetText(preset)).toContain('\n');
    expect(JSON.parse(presetText(preset))).toEqual(preset.payload);
  });
});
