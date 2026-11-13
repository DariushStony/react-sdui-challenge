// @vitest-environment node
import { MESSAGE_CODES } from '../../test/message-codes';
import { createTranslator } from '.';
import { enMessages } from '../en-messages';
import { faMessages } from '../fa-messages';

// TC-U20. Every code the app or the server can send has text in each shipped language; parameters
// are filled in with that language's digits; a gap is visible (the key itself plus a console
// warning), never silent. A translator is built from a `Messages` object, so a host can bring its own.
afterEach(() => {
  vi.restoreAllMocks();
});

const fa = () => createTranslator(faMessages);
const en = () => createTranslator(enMessages);

describe('the shipped catalogs', () => {
  it('have the same keys, so no language is missing a message', () => {
    expect(Object.keys(enMessages.catalog).toSorted()).toEqual(
      Object.keys(faMessages.catalog).toSorted(),
    );
  });

  it.each(MESSAGE_CODES)('Persian has text for %s', (code) => {
    const { hasMessage, t } = fa();
    expect(hasMessage(code)).toBe(true);
    expect(t(code, { min: 1, max: 1, file: 'a.png', accept: 'image/*', maxBytes: 1024 })).toMatch(
      /\p{Script=Arabic}/u,
    );
  });

  it.each(MESSAGE_CODES)('English has text for %s', (code) => {
    const { hasMessage, t } = en();
    expect(hasMessage(code)).toBe(true);
    const text = t(code, { min: 1, max: 1, file: 'a.png', accept: 'image/*', maxBytes: 1024 });
    expect(text).toMatch(/[A-Za-z]/);
    expect(text).not.toMatch(/\p{Script=Arabic}/u);
  });
});

describe('t in Persian', () => {
  it('fills a number parameter with Persian digits', () => {
    const { t } = fa();
    expect(t('too_short', { min: 3 })).toContain('۳');
    expect(t('too_long', { max: 40 })).toContain('۴۰');
  });

  it('fills a text parameter as it is', () => {
    const { t } = fa();
    expect(t('file_type', { file: 'photo.png', accept: 'image/*, .pdf' })).toContain('photo.png');
    expect(t('file_type', { file: 'photo.png', accept: 'image/*, .pdf' })).toContain(
      'image/*, .pdf',
    );
  });

  it('shows a byte count as a size', () => {
    expect(fa().t('file_too_large', { file: 'a.png', maxBytes: 5 * 1024 * 1024 })).toContain(
      '۵ مگابایت',
    );
  });
});

describe('t in English', () => {
  it('fills numbers with Latin digits and sizes with English units', () => {
    const { t } = en();
    expect(t('too_short', { min: 3 })).toBe('Minimum length: 3.');
    expect(t('file_too_large', { file: 'a.png', maxBytes: 5 * 1024 * 1024 })).toBe(
      'The file "a.png" is larger than 5 MB.',
    );
  });
});

describe('a gap in the data', () => {
  it('returns the key and warns once when there is no text for it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { t } = fa();
    expect(t('no_such_key_a')).toBe('no_such_key_a');
    expect(t('no_such_key_a')).toBe('no_such_key_a');
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('keeps the placeholder visible and warns when a parameter is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(fa().t('too_short')).toContain('{min}');
    expect(warn).toHaveBeenCalled();
  });

  it("warns once per translator, so one host's gaps do not hide another's", () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    fa().t('no_such_key_b');
    fa().t('no_such_key_b');
    expect(warn).toHaveBeenCalledTimes(2);
  });
});

describe('describeError', () => {
  it('uses the catalog text when the code is known', () => {
    const { describeError, t } = fa();
    expect(describeError({ code: 'required' })).toBe(t('required'));
    expect(describeError({ code: 'too_short', params: { min: 3 } })).toBe(
      t('too_short', { min: 3 }),
    );
  });

  it('falls back to the server message for a code the client does not know', () => {
    expect(fa().describeError({ code: 'brand_not_allowed', message: 'این برند مجاز نیست' })).toBe(
      'این برند مجاز نیست',
    );
  });

  it('falls back to a generic message when there is nothing else', () => {
    const { describeError, t } = fa();
    expect(describeError({ code: 'brand_not_allowed' })).toBe(t('unknown_error'));
  });

  it('prefers the catalog over a server message for a known code', () => {
    const { describeError, t } = fa();
    expect(describeError({ code: 'required', message: 'from the server' })).toBe(t('required'));
  });

  // The contract makes params optional. A known code that needs values it was not given must not
  // show raw {placeholders}; the server's text, or the generic one, is better.
  it.each(['file_too_large', 'too_long', 'too_short', 'file_type'])(
    'does not show placeholders when %s arrives without its params',
    (code) => {
      for (const translator of [fa(), en()]) {
        const { describeError, t } = translator;
        expect(describeError({ code })).toBe(t('unknown_error'));
        expect(describeError({ code, message: 'server text' })).toBe('server text');
        expect(describeError({ code, params: {} })).toBe(t('unknown_error'));
      }
    },
  );
});

describe('formatNumber', () => {
  it.each([
    [3, '۳'],
    [40, '۴۰'],
    [1900, '۱۹۰۰'],
    [2.5, '۲٫۵'],
    [0, '۰'],
    // A limit must read as it is written: 0.005 shown as 0.01 would contradict the rule.
    [0.005, '۰٫۰۰۵'],
    [0.001, '۰٫۰۰۱'],
    [12.3456, '۱۲٫۳۴۵۶'],
  ])('shows %d as %s in Persian (no thousands separator)', (value, expected) => {
    expect(fa().formatNumber(value)).toBe(expected);
  });

  it('follows the locale of the messages', () => {
    expect(en().formatNumber(1900)).toBe('1900');
    expect(en().formatNumber(0.005)).toBe('0.005');
    expect(createTranslator({ locale: 'de-DE', catalog: {} }).formatNumber(2.5)).toBe('2,5');
  });
});

describe('formatBytes', () => {
  it.each([
    [0, '۰ بایت'],
    [512, '۵۱۲ بایت'],
    [1024, '۱ کیلوبایت'],
    [1536, '۱٫۵ کیلوبایت'],
    [5 * 1024 * 1024, '۵ مگابایت'],
    [1.5 * 1024 * 1024, '۱٫۵ مگابایت'],
    [2 * 1024 ** 3, '۲ گیگابایت'],
  ])('shows %d bytes as %s in Persian', (bytes, expected) => {
    expect(fa().formatBytes(bytes)).toBe(expected);
  });

  it.each([
    [512, '512 B'],
    [1536, '1.5 KB'],
    [5 * 1024 * 1024, '5 MB'],
    [2 * 1024 ** 3, '2 GB'],
  ])('shows %d bytes as %s in English', (bytes, expected) => {
    expect(en().formatBytes(bytes)).toBe(expected);
  });

  it('uses the largest unit that keeps the number at 1 or more, rounded to one decimal', () => {
    const { formatBytes } = fa();
    expect(formatBytes(1023)).toBe('۱۰۲۳ بایت');
    expect(formatBytes(1024 * 1024 - 1)).toMatch(/کیلوبایت$/);
    expect(formatBytes(1024 + 51)).toBe('۱ کیلوبایت');
    expect(formatBytes(1024 + 52)).toBe('۱٫۱ کیلوبایت');
  });

  it('falls back to plain unit letters when the catalog has no names for them', () => {
    expect(createTranslator({ locale: 'en-US', catalog: {} }).formatBytes(2048)).toBe('2 KB');
  });
});
