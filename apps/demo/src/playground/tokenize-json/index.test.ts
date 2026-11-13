import { PRESETS } from '../presets/presets';
import { presetText } from '../presets/preset-text';
import { tokenizeJson } from '.';

const kinds = (text: string) =>
  tokenizeJson(text)
    .filter((token) => token.type !== 'space')
    .map((token) => [token.type, token.text]);

// TC-U33: the Playground colours its JSON box with this. It must keep every character of the text,
// including text that is not JSON, because the box is where a person fixes a typo.
describe('tokenizeJson', () => {
  it('names keys, strings, numbers, literals and punctuation', () => {
    expect(kinds('{"a": "x", "n": -1.5e+3, "t": true, "f": false, "z": null, "l": [1]}')).toEqual([
      ['punctuation', '{'],
      ['key', '"a"'],
      ['punctuation', ':'],
      ['string', '"x"'],
      ['punctuation', ','],
      ['key', '"n"'],
      ['punctuation', ':'],
      ['number', '-1.5e+3'],
      ['punctuation', ','],
      ['key', '"t"'],
      ['punctuation', ':'],
      ['literal', 'true'],
      ['punctuation', ','],
      ['key', '"f"'],
      ['punctuation', ':'],
      ['literal', 'false'],
      ['punctuation', ','],
      ['key', '"z"'],
      ['punctuation', ':'],
      ['literal', 'null'],
      ['punctuation', ','],
      ['key', '"l"'],
      ['punctuation', ':'],
      ['punctuation', '['],
      ['number', '1'],
      ['punctuation', ']'],
      ['punctuation', '}'],
    ]);
  });

  it('tells a key from a string by the colon after it, even across spaces and lines', () => {
    expect(kinds('{"a"  \n : "b"}').map(([type]) => type)).toEqual([
      'punctuation',
      'key',
      'punctuation',
      'string',
      'punctuation',
    ]);
  });

  it('keeps an escaped quote inside its string, and Persian text as it is', () => {
    expect(kinds('["a\\"b", "برند:"]')).toEqual([
      ['punctuation', '['],
      ['string', '"a\\"b"'],
      ['punctuation', ','],
      ['string', '"برند:"'],
      ['punctuation', ']'],
    ]);
  });

  it('does not take the start of a longer word for a literal or a number', () => {
    expect(kinds('truest nullable 12abc')).toEqual([
      ['invalid', 'truest'],
      ['invalid', 'nullable'],
      ['invalid', '12abc'],
    ]);
  });

  it('ends an unterminated string at the end of its line', () => {
    expect(kinds('{"a": "open\n}')).toEqual([
      ['punctuation', '{'],
      ['key', '"a"'],
      ['punctuation', ':'],
      ['string', '"open'],
      ['punctuation', '}'],
    ]);
  });

  it('marks text that is not JSON as invalid and keeps going', () => {
    expect(kinds("{'a': 1}")).toEqual([
      ['punctuation', '{'],
      ['invalid', "'a'"],
      ['punctuation', ':'],
      ['number', '1'],
      ['punctuation', '}'],
    ]);
  });

  it('returns nothing for empty text', () => {
    expect(tokenizeJson('')).toEqual([]);
  });

  it.each([
    ['empty', ''],
    ['only spaces', '  \n\t '],
    ['broken', '{"a": [1, , "x'],
    ['single quotes', "{'a': 'b'}"],
    ['a lone backslash', '\\'],
    ['mixed scripts', '{"برند": "پژو 206", "year": ۲۰۱۹}'],
  ])('keeps every character of %s text, in order', (_name, text) => {
    expect(
      tokenizeJson(text)
        .map((token) => token.text)
        .join(''),
    ).toBe(text);
  });

  it.each(PRESETS.map((preset) => [preset.id, presetText(preset)] as const))(
    'keeps every character of the %s preset, with no invalid part',
    (_id, text) => {
      const tokens = tokenizeJson(text);
      expect(tokens.map((token) => token.text).join('')).toBe(text);
      expect(tokens.filter((token) => token.type === 'invalid')).toEqual([]);
    },
  );
});
