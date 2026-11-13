// @vitest-environment node
import { MESSAGE_CODES } from '../core/message-codes';
import { describeError, hasMessage, t } from './t';

// TC-U20. Every code the app or the server can send has Persian text; parameters are filled in with
// Persian digits; a gap is visible (the code itself plus a console warning), never silent.
afterEach(() => {
  vi.restoreAllMocks();
});

describe('the Persian catalog', () => {
  it.each(MESSAGE_CODES)('has Persian text for %s', (code) => {
    expect(hasMessage(code)).toBe(true);
    expect(t(code, { min: 1, max: 1, file: 'a.png', accept: 'image/*', maxBytes: 1024 })).toMatch(
      /\p{Script=Arabic}/u,
    );
  });
});

describe('t', () => {
  it('fills a number parameter with Persian digits', () => {
    expect(t('too_short', { min: 3 })).toContain('۳');
    expect(t('too_long', { max: 40 })).toContain('۴۰');
  });

  it('fills a text parameter as it is', () => {
    expect(t('file_type', { file: 'photo.png', accept: 'image/*, .pdf' })).toContain('photo.png');
    expect(t('file_type', { file: 'photo.png', accept: 'image/*, .pdf' })).toContain(
      'image/*, .pdf',
    );
  });

  it('shows a byte count as a size', () => {
    expect(t('file_too_large', { file: 'a.png', maxBytes: 5 * 1024 * 1024 })).toContain(
      '۵ مگابایت',
    );
  });

  it('returns the key and warns once when there is no text for it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(t('no_such_key_a')).toBe('no_such_key_a');
    expect(t('no_such_key_a')).toBe('no_such_key_a');
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('keeps the placeholder visible and warns when a parameter is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(t('too_short')).toContain('{min}');
    expect(warn).toHaveBeenCalled();
  });
});

describe('describeError', () => {
  it('uses the catalog text when the code is known', () => {
    expect(describeError({ code: 'required' })).toBe(t('required'));
    expect(describeError({ code: 'too_short', params: { min: 3 } })).toBe(
      t('too_short', { min: 3 }),
    );
  });

  it('falls back to the server message for a code the client does not know', () => {
    expect(describeError({ code: 'brand_not_allowed', message: 'این برند مجاز نیست' })).toBe(
      'این برند مجاز نیست',
    );
  });

  it('falls back to a generic message when there is nothing else', () => {
    expect(describeError({ code: 'brand_not_allowed' })).toBe(t('unknown_error'));
  });

  it('prefers the catalog over a server message for a known code', () => {
    expect(describeError({ code: 'required', message: 'from the server' })).toBe(t('required'));
  });
});
