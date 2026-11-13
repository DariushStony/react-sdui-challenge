// @vitest-environment node
import { formatBytes, formatNumber } from './format';

// Sizes and numbers shown to a person use Persian digits and units. The server and the validation
// rules always work in bytes and plain numbers; only display goes through these.
describe('formatNumber', () => {
  it.each([
    [3, '۳'],
    [40, '۴۰'],
    [1900, '۱۹۰۰'],
    [2.5, '۲٫۵'],
    [0, '۰'],
  ])('shows %d as %s (no thousands separator)', (value, expected) => {
    expect(formatNumber(value)).toBe(expected);
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
  ])('shows %d bytes as %s', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });

  it('uses the largest unit that keeps the number at 1 or more', () => {
    expect(formatBytes(1023)).toBe('۱۰۲۳ بایت');
    expect(formatBytes(1024 * 1024 - 1)).toMatch(/کیلوبایت$/);
  });

  it('rounds to one decimal place', () => {
    expect(formatBytes(1024 + 51)).toBe('۱ کیلوبایت');
    expect(formatBytes(1024 + 52)).toBe('۱٫۱ کیلوبایت');
  });
});
