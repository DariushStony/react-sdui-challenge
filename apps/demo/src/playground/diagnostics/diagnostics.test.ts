import { normalize } from '@dynamic-form/renderer/core';
import { analyzeInput } from './analyze-input';

// FR-36: whatever is typed, the Playground gets a value to show, never an exception.
describe('analyzeInput', () => {
  it.each(['', '   ', '\n\t'])('calls "%s" empty', (text) => {
    expect(analyzeInput(text, normalize)).toEqual({ type: 'empty' });
  });

  it.each(['{', '{"fields": [', 'not json', "{'a': 1}", '[1, 2,]'])(
    'reports the JSON error of %j instead of throwing',
    (text) => {
      const analysis = analyzeInput(text, normalize);
      expect(analysis.type).toBe('invalid-json');
      expect(analysis.type === 'invalid-json' && analysis.message).toMatch(/\S/);
    },
  );

  it('hands valid JSON to the normalizer and returns its result', () => {
    const analysis = analyzeInput('{"schemaVersion": 2, "fields": []}', normalize);
    expect(analysis).toMatchObject({ type: 'parsed', result: { ok: true } });
  });

  it.each(['null', '42', '"text"', '[]', '{"fields": "nope"}'])(
    'turns the valid JSON %s that is not a form into a rejection',
    (text) => {
      expect(analyzeInput(text, normalize)).toMatchObject({
        type: 'parsed',
        result: { ok: false, reason: 'invalid' },
      });
    },
  );

  it('passes a form id to the normalizer so the model has one', () => {
    const analysis = analyzeInput('{"fields": []}', normalize);
    expect(analysis.type === 'parsed' && analysis.result.ok && analysis.result.model.formId).toBe(
      'playground',
    );
  });
});
